import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/utils/auth";
import { markOverdueInvoices } from "@/lib/billing";

export async function GET() {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	await markOverdueInvoices(ctx.organisationId);

	const invoices = await prisma.invoice.findMany({
		where: { organisationId: ctx.organisationId },
		include: {
			student: { select: { id: true, firstName: true, lastName: true } },
			term: { select: { id: true, name: true } },
			payments: true,
		},
		orderBy: { createdAt: "desc" },
	});

	return NextResponse.json(invoices);
}

export async function POST(request: NextRequest) {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	if (ctx.role !== "OWNER" && ctx.role !== "ADMIN") {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const body = await request.json();
	const { termId, studentIds } = body;

	if (!termId) {
		return NextResponse.json({ error: "Term is required" }, { status: 400 });
	}

	const term = await prisma.term.findFirst({
		where: { id: parseInt(termId), organisationId: ctx.organisationId },
	});
	if (!term) return NextResponse.json({ error: "Term not found" }, { status: 404 });

	const settings = await prisma.billingSettings.findUnique({
		where: { organisationId: ctx.organisationId },
		include: { discounts: true },
	});
	const defaultRate = settings?.defaultTermRateCents ?? 0;
	const taxRate = settings?.taxRatePercent ?? 0;
	const taxInclusive = settings?.taxInclusive ?? false;

	let students;
	if (studentIds && studentIds.length > 0) {
		students = await prisma.student.findMany({
			where: { id: { in: studentIds.map((id: string) => parseInt(id)) }, organisationId: ctx.organisationId, isArchived: false },
			include: { discounts: { include: { discount: true } } },
		});
	} else {
		students = await prisma.student.findMany({
			where: { organisationId: ctx.organisationId, isArchived: false },
			include: { discounts: { include: { discount: true } } },
		});
	}

	const lastInvoice = await prisma.invoice.findFirst({
		where: { organisationId: ctx.organisationId },
		orderBy: { createdAt: "desc" },
		select: { number: true },
	});
	let nextNum = 1;
	if (lastInvoice?.number) {
		const match = lastInvoice.number.match(/(\d+)$/);
		if (match) nextNum = parseInt(match[1]) + 1;
	}

	const invoices = [];
	for (const student of students) {
		const existing = await prisma.invoice.findFirst({
			where: { organisationId: ctx.organisationId, studentId: student.id, termId: term.id },
		});
		if (existing) continue;

		const rate = student.customTermRateCents ?? defaultRate;
		let discountTotal = 0;
		for (const sd of student.discounts) {
			if (sd.discount.type === "PERCENTAGE") {
				discountTotal += Math.round(rate * (sd.discount.value / 100));
			} else {
				discountTotal += Math.round(sd.discount.value);
			}
		}

		const subtotal = Math.max(0, rate - discountTotal);
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
		const year = new Date().getFullYear();
		const number = `INV-${year}-${String(nextNum).padStart(3, "0")}`;
		nextNum++;

		const invoice = await prisma.invoice.create({
			data: {
				number,
				amount: rate,
				discount: discountTotal,
				tax: taxCents,
				total,
				status: "DRAFT",
				dueDate: term.endDate,
				organisationId: ctx.organisationId,
				studentId: student.id,
				termId: term.id,
				lineItems: {
					create: {
						description: `${term.name} ${term.year}`,
						quantity: 1,
						unitPriceCents: rate,
						amountCents: rate,
					},
				},
			},
		});
		invoices.push(invoice);
	}

	return NextResponse.json({ created: invoices.length, invoices });
}
