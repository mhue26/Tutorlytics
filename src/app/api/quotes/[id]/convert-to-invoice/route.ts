import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/utils/auth";

export async function POST(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	if (ctx.role !== "OWNER" && ctx.role !== "ADMIN") {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { id: quoteId } = await params();
	const quote = await prisma.quote.findFirst({
		where: { id: quoteId, organisationId: ctx.organisationId },
	});
	if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });
	if (quote.status === "CONVERTED") {
		return NextResponse.json(
			{ error: "Quote already converted to an invoice" },
			{ status: 400 }
		);
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
	const number = `INV-${year}-${String(nextNum).padStart(3, "0")}`;

	const invoice = await prisma.invoice.create({
		data: {
			number,
			amount: quote.amount,
			discount: quote.discount,
			tax: quote.tax,
			total: quote.total,
			status: "DRAFT",
			dueDate: quote.dueDate,
			notes: quote.notes,
			organisationId: quote.organisationId,
			studentId: quote.studentId,
			termId: quote.termId,
			lineItems: {
				create: {
					description: `From quote ${quote.number}`,
					quantity: 1,
					unitPriceCents: quote.amount,
					amountCents: quote.amount,
				},
			},
		},
	});

	await prisma.quote.update({
		where: { id: quoteId },
		data: { status: "CONVERTED", convertedToInvoiceId: invoice.id },
	});

	return NextResponse.json({ invoice: { id: invoice.id, number: invoice.number } });
}
