import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/utils/auth";

export async function GET() {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const quotes = await prisma.quote.findMany({
		where: { organisationId: ctx.organisationId },
		include: {
			student: { select: { id: true, firstName: true, lastName: true } },
			term: { select: { id: true, name: true, year: true } },
		},
		orderBy: { createdAt: "desc" },
	});

	return NextResponse.json(quotes);
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

	const studentFilter = studentIds?.length
		? { id: { in: studentIds.map((id: string) => parseInt(id, 10)) } }
		: {};
	const students = await prisma.student.findMany({
		where: { organisationId: ctx.organisationId, isArchived: false, ...studentFilter },
		include: { discounts: { include: { discount: true } } },
	});

	const lastQuote = await prisma.quote.findFirst({
		where: { organisationId: ctx.organisationId },
		orderBy: { createdAt: "desc" },
		select: { number: true },
	});
	let nextNum = 1;
	if (lastQuote?.number) {
		const match = lastQuote.number.match(/(\d+)$/);
		if (match) nextNum = parseInt(match[1], 10) + 1;
	}

	const year = new Date().getFullYear();
	const created: { id: string; number: string }[] = [];

	for (const student of students) {
		const existing = await prisma.quote.findFirst({
			where: { organisationId: ctx.organisationId, studentId: student.id, termId: term.id },
		});
		if (existing) continue;

		const rate = student.customTermRateCents ?? defaultRate;
		let discountTotal = 0;
		for (const sd of student.discounts) {
			if (sd.discount.type === "PERCENTAGE") {
				discountTotal += Math.round(rate * (sd.discount.value / 100));
			} else {
				discountTotal += Math.round(Number(sd.discount.value));
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

		const number = `QUO-${year}-${String(nextNum).padStart(3, "0")}`;
		nextNum++;

		const quote = await prisma.quote.create({
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
			},
		});
		created.push({ id: quote.id, number: quote.number });
	}

	return NextResponse.json({ created: created.length, quotes: created });
}
