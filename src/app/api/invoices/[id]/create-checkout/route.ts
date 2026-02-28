import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/utils/auth";

const stripe = process.env.STRIPE_SECRET_KEY
	? new Stripe(process.env.STRIPE_SECRET_KEY)
	: null;

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	if (!stripe) {
		return NextResponse.json(
			{ error: "Online payment is not configured. Set STRIPE_SECRET_KEY." },
			{ status: 503 }
		);
	}

	const { id: invoiceId } = await params;
	const invoice = await prisma.invoice.findFirst({
		where: { id: invoiceId, organisationId: ctx.organisationId },
		include: {
			organisation: { select: { name: true } },
			student: { select: { firstName: true, lastName: true } },
			term: { select: { name: true, year: true } },
			payments: { select: { amount: true } },
		},
	});

	if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
	if (invoice.status === "PAID") {
		return NextResponse.json({ error: "Invoice is already paid" }, { status: 400 });
	}
	if (invoice.status === "CANCELLED") {
		return NextResponse.json({ error: "Invoice is cancelled" }, { status: 400 });
	}

	const dueCents = invoice.total - invoice.payments.reduce((s, p) => s + p.amount, 0);
	if (dueCents <= 0) {
		return NextResponse.json({ error: "No amount due" }, { status: 400 });
	}

	const settings = await prisma.billingSettings.findUnique({
		where: { organisationId: ctx.organisationId },
	});
	const currency = (settings?.currency ?? "AUD").toLowerCase();

	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl?.origin || "https://localhost:3000";

	const session = await stripe.checkout.sessions.create({
		payment_method_types: ["card"],
		line_items: [
			{
				price_data: {
					currency,
					unit_amount: dueCents,
					product_data: {
						name: `Invoice ${invoice.number}`,
						description: invoice.term
							? `${invoice.term.name} ${invoice.term.year} — ${invoice.student.firstName} ${invoice.student.lastName}`
							: `${invoice.organisation.name} — ${invoice.student.firstName} ${invoice.student.lastName}`,
					},
				},
				quantity: 1,
			},
		],
		mode: "payment",
		success_url: `${baseUrl}/billing/invoices/${invoiceId}?paid=1`,
		cancel_url: `${baseUrl}/billing/invoices/${invoiceId}`,
		metadata: {
			invoiceId,
			organisationId: ctx.organisationId,
			studentId: String(invoice.studentId),
		},
	});

	return NextResponse.json({ url: session.url });
}
