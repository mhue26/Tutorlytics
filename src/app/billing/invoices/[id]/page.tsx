import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import { markOverdueInvoices } from "@/lib/billing";
import InvoiceDetailClient from "./InvoiceDetailClient";

export default async function InvoiceDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const ctx = await requireOrgContext();
	const { id } = await params;

	await markOverdueInvoices(ctx.organisationId);

	const invoice = await prisma.invoice.findFirst({
		where: { id, organisationId: ctx.organisationId },
		include: {
			student: { select: { id: true, firstName: true, lastName: true, email: true } },
			term: { select: { id: true, name: true, startDate: true, endDate: true, year: true } },
			payments: { orderBy: { date: "desc" } },
			lineItems: { orderBy: { createdAt: "asc" } },
		},
	});

	if (!invoice) notFound();

	const canManage = ctx.role === "OWNER" || ctx.role === "ADMIN";

	return (
		<div className="space-y-6 pt-8 font-sans" style={{ fontFamily: "'Work Sans', sans-serif" }}>
			<div>
				<Link
					href="/billing"
					className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
				>
					← Back to Billing
				</Link>
				<h1 className="mt-1 text-2xl font-semibold text-[#3D4756]">
					Invoice {invoice.number}
				</h1>
			</div>

			<InvoiceDetailClient
				invoice={{
					id: invoice.id,
					number: invoice.number,
					amount: invoice.amount,
					discount: invoice.discount,
					tax: invoice.tax,
					total: invoice.total,
					status: invoice.status,
					dueDate: invoice.dueDate?.toISOString() ?? null,
					notes: invoice.notes,
					createdAt: invoice.createdAt.toISOString(),
					student: invoice.student,
					term: invoice.term,
					payments: invoice.payments.map((p) => ({
						id: p.id,
						amount: p.amount,
						method: p.method,
						reference: p.reference,
						date: p.date.toISOString(),
						notes: p.notes,
					})),
					lineItems: invoice.lineItems.map((li) => ({
						id: li.id,
						description: li.description,
						quantity: li.quantity,
						unitPriceCents: li.unitPriceCents,
						amountCents: li.amountCents,
					})),
				}}
				canManage={canManage}
			/>
		</div>
	);
}
