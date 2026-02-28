import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/utils/auth";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	if (ctx.role !== "OWNER" && ctx.role !== "ADMIN") {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { id } = await params;
	const invoice = await prisma.invoice.findFirst({
		where: { id, organisationId: ctx.organisationId },
		include: {
			organisation: { select: { name: true } },
			student: { select: { firstName: true, lastName: true, email: true } },
			term: { select: { name: true, year: true } },
		},
	});

	if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
	if (invoice.status !== "DRAFT") {
		return NextResponse.json({ error: "Only draft invoices can be sent" }, { status: 400 });
	}

	const toEmail = invoice.student.email;
	if (!toEmail?.trim()) {
		return NextResponse.json(
			{ error: "Student has no email address. Add an email in the student profile." },
			{ status: 400 }
		);
	}

	const baseUrl =
		process.env.NEXT_PUBLIC_APP_URL ||
		(request.nextUrl?.origin ?? "https://localhost:3000");
	const printUrl = `${baseUrl}/billing/invoices/${id}/print`;
	const totalFormatted = `$${(invoice.total / 100).toFixed(2)}`;

	const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Invoice ${invoice.number}</title></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Hi ${invoice.student.firstName},</p>
  <p>Please find your invoice from ${invoice.organisation.name} below.</p>
  <p><strong>Invoice ${invoice.number}</strong>${invoice.term ? ` — ${invoice.term.name} ${invoice.term.year}` : ""}</p>
  <p><strong>Amount due: ${totalFormatted}</strong></p>
  ${invoice.dueDate ? `<p>Due date: ${new Date(invoice.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>` : ""}
  <p><a href="${printUrl}" style="display: inline-block; background: #3D4756; color: white; padding: 10px 18px; text-decoration: none; border-radius: 8px; margin-top: 12px;">View / Print invoice</a></p>
  <p style="margin-top: 24px; font-size: 14px; color: #666;">If you have any questions, please reply to this email.</p>
</body>
</html>
`.trim();

	if (!resend) {
		return NextResponse.json(
			{
				error: "Email is not configured. Set RESEND_API_KEY in your environment to send invoices by email.",
			},
			{ status: 503 }
		);
	}

	const fromEmail = process.env.RESEND_FROM_EMAIL ?? "invoices@resend.dev";
	const { error } = await resend.emails.send({
		from: fromEmail,
		to: [toEmail.trim()],
		subject: `Invoice ${invoice.number} from ${invoice.organisation.name}`,
		html,
	});

	if (error) {
		console.error("Resend error:", error);
		return NextResponse.json(
			{ error: error.message ?? "Failed to send email" },
			{ status: 500 }
		);
	}

	await prisma.invoice.update({
		where: { id },
		data: { status: "SENT", sentAt: new Date() },
	});

	return NextResponse.json({ sent: true });
}
