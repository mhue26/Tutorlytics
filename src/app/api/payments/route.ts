import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/utils/auth";

export async function GET() {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const payments = await prisma.payment.findMany({
		where: { organisationId: ctx.organisationId },
		include: {
			student: { select: { id: true, firstName: true, lastName: true } },
			invoice: { select: { id: true, number: true } },
		},
		orderBy: { date: "desc" },
		take: 50,
	});

	return NextResponse.json(payments);
}

export async function POST(request: NextRequest) {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const body = await request.json();
	const { invoiceId, studentId, amount, method, reference, date, notes } = body;

	if (!studentId || !amount || !method || !date) {
		return NextResponse.json({ error: "Student, amount, method, and date are required" }, { status: 400 });
	}

	const payment = await prisma.payment.create({
		data: {
			amount: Math.round(parseFloat(amount) * 100),
			method,
			reference: reference || null,
			date: new Date(date),
			notes: notes || null,
			organisationId: ctx.organisationId,
			studentId: parseInt(studentId),
			invoiceId: invoiceId || null,
			recordedById: ctx.userId,
		},
	});

	if (invoiceId) {
		const allPayments = await prisma.payment.findMany({
			where: { invoiceId },
			select: { amount: true },
		});
		const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
		const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
		if (invoice) {
			let newStatus = invoice.status;
			if (totalPaid >= invoice.total) {
				newStatus = "PAID";
			} else if (totalPaid > 0) {
				newStatus = "PARTIALLY_PAID";
			}
			if (newStatus !== invoice.status) {
				await prisma.invoice.update({ where: { id: invoiceId }, data: { status: newStatus } });
			}
		}
	}

	return NextResponse.json(payment);
}
