import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/utils/auth";

/**
 * Find completed meetings in date range that are not yet on any invoice line item.
 * Create one invoice per student with line items for each meeting (using student hourly rate or meeting total).
 */
export async function POST(request: NextRequest) {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	if (ctx.role !== "OWNER" && ctx.role !== "ADMIN") {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const body = await request.json();
	const { dateFrom, dateTo, studentIds } = body as {
		dateFrom: string;
		dateTo: string;
		studentIds?: number[];
	};

	if (!dateFrom || !dateTo) {
		return NextResponse.json(
			{ error: "dateFrom and dateTo are required (YYYY-MM-DD)" },
			{ status: 400 }
		);
	}

	const from = new Date(dateFrom);
	const to = new Date(dateTo);
	to.setHours(23, 59, 59, 999);
	if (from > to) {
		return NextResponse.json({ error: "dateFrom must be before dateTo" }, { status: 400 });
	}

	// Line items in this org that reference a meeting (already invoiced)
	const invoicedMeetingIds = await prisma.invoiceLineItem
		.findMany({
			where: {
				meetingId: { not: null },
				invoice: { organisationId: ctx.organisationId },
			},
			select: { meetingId: true },
		})
		.then((rows) => new Set(rows.map((r) => r.meetingId!).filter(Boolean)));

	const meetings = await prisma.meeting.findMany({
		where: {
			organisationId: ctx.organisationId,
			isCompleted: true,
			startTime: { gte: from, lte: to },
			...(studentIds?.length ? { studentId: { in: studentIds.map((id: number) => Number(id)) } } : {}),
			id: { notIn: [...invoicedMeetingIds] },
		},
		include: {
			student: {
				select: {
					id: true,
					firstName: true,
					lastName: true,
					hourlyRateCents: true,
					discounts: { include: { discount: true } },
				},
			},
		},
		orderBy: [{ studentId: "asc" }, { startTime: "asc" }],
	});

	if (meetings.length === 0) {
		return NextResponse.json({
			created: 0,
			invoices: [],
			message: "No uninvoiced completed lessons in this date range.",
		});
	}

	const settings = await prisma.billingSettings.findUnique({
		where: { organisationId: ctx.organisationId },
	});
	const defaultHourlyCents = settings?.defaultTermRateCents ?? 0;
	const taxRate = settings?.taxRatePercent ?? 0;
	const taxInclusive = settings?.taxInclusive ?? false;

	// Group by student
	const byStudent = new Map<number, typeof meetings>();
	for (const m of meetings) {
		const list = byStudent.get(m.studentId) ?? [];
		list.push(m);
		byStudent.set(m.studentId, list);
	}

	const lastInvoice = await prisma.invoice.findFirst({
		where: { organisationId: ctx.organisationId },
		orderBy: { createdAt: "desc" },
		select: { number: true },
	});
	let nextNum = 1;
	if (lastInvoice?.number) {
		const match = lastInvoice.number.match(/(\d+)$/);
		if (match) nextNum = parseInt(match[1], 10) + 1;
	}

	const year = new Date().getFullYear();
	const dueDate = new Date(to);
	dueDate.setDate(dueDate.getDate() + 14);

	const created: { id: string; number: string; studentId: number; lineCount: number }[] = [];

	for (const [studentId, studentMeetings] of byStudent) {
		const student = studentMeetings[0].student;
		const hourlyCents = student.hourlyRateCents || defaultHourlyCents;

		let amountTotal = 0;
		const lineItemsData: { description: string; quantity: number; unitPriceCents: number; amountCents: number; meetingId: number }[] = [];

		for (const m of studentMeetings) {
			const durationMs = m.endTime.getTime() - m.startTime.getTime();
			const durationHours = durationMs / (1000 * 60 * 60);
			let amountCents: number;
			if (m.totalCents != null && m.totalCents > 0) {
				amountCents = m.totalCents;
			} else {
				amountCents = Math.round(durationHours * hourlyCents);
			}
			const desc = `Lesson ${m.startTime.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
			lineItemsData.push({
				description: desc,
				quantity: 1,
				unitPriceCents: amountCents,
				amountCents,
				meetingId: m.id,
			});
			amountTotal += amountCents;
		}

		// Apply student discounts (same logic as term invoices)
		let discountTotal = 0;
		for (const sd of student.discounts) {
			if (sd.discount.type === "PERCENTAGE") {
				discountTotal += Math.round(amountTotal * (sd.discount.value / 100));
			} else {
				discountTotal += Math.round(Number(sd.discount.value));
			}
		}
		const subtotal = Math.max(0, amountTotal - discountTotal);
		let taxCents = 0;
		let total = subtotal;
		if (taxRate > 0) {
			if (taxInclusive) {
				taxCents = Math.round(subtotal - subtotal / (1 + taxRate / 100));
				total = subtotal;
			} else {
				taxCents = Math.round(subtotal * (taxRate / 100));
				total = subtotal + taxCents;
			}
		}

		const number = `INV-${year}-${String(nextNum).padStart(3, "0")}`;
		nextNum++;

		const inv = await prisma.invoice.create({
			data: {
				number,
				amount: amountTotal,
				discount: discountTotal,
				tax: taxCents,
				total,
				status: "DRAFT",
				dueDate,
				organisationId: ctx.organisationId,
				studentId,
				termId: null,
				lineItems: {
					create: lineItemsData.map((li) => ({
						description: li.description,
						quantity: li.quantity,
						unitPriceCents: li.unitPriceCents,
						amountCents: li.amountCents,
						meetingId: li.meetingId,
					})),
				},
			},
		});

		created.push({
			id: inv.id,
			number,
			studentId,
			lineCount: lineItemsData.length,
		});
	}

	return NextResponse.json({
		created: created.length,
		invoices: created,
		message: `Created ${created.length} invoice(s) from ${meetings.length} lesson(s).`,
	});
}
