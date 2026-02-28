import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import PrintActions from "./PrintActions";

export default async function InvoicePrintPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const ctx = await requireOrgContext();
	const { id } = await params;

	const invoice = await prisma.invoice.findFirst({
		where: { id, organisationId: ctx.organisationId },
		include: {
			organisation: { select: { name: true } },
			student: { select: { firstName: true, lastName: true, email: true } },
			term: { select: { name: true, year: true } },
			lineItems: { orderBy: { createdAt: "asc" } },
			payments: { select: { amount: true } },
		},
	});

	if (!invoice) notFound();

	const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;
	const paidTotal = invoice.payments?.reduce((s, p) => s + p.amount, 0) ?? 0;

	return (
		<div className="min-h-screen bg-white p-8 font-sans" style={{ fontFamily: "'Work Sans', sans-serif" }}>
			<PrintActions invoiceId={id} />

			{/* Invoice content */}
			<article className="max-w-2xl mx-auto">
				<header className="border-b border-gray-200 pb-6 mb-6">
					<h1 className="text-2xl font-semibold text-gray-900">
						{invoice.organisation.name}
					</h1>
					<h2 className="mt-4 text-xl font-semibold text-[#3D4756]">
						Invoice {invoice.number}
					</h2>
					<p className="mt-1 text-sm text-gray-500">
						Issued {new Date(invoice.createdAt).toLocaleDateString("en-GB", {
							day: "numeric",
							month: "long",
							year: "numeric",
						})}
					</p>
				</header>

				<div className="grid grid-cols-2 gap-8 mb-8">
					<div>
						<p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
							Bill to
						</p>
						<p className="font-medium text-gray-900">
							{invoice.student.firstName} {invoice.student.lastName}
						</p>
						{invoice.student.email && (
							<p className="text-sm text-gray-600">{invoice.student.email}</p>
						)}
					</div>
					<div className="text-right">
						{invoice.dueDate && (
							<>
								<p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
									Due date
								</p>
								<p className="text-gray-900">
									{new Date(invoice.dueDate).toLocaleDateString("en-GB", {
										day: "numeric",
										month: "long",
										year: "numeric",
									})}
								</p>
							</>
						)}
					</div>
				</div>

				{invoice.lineItems && invoice.lineItems.length > 0 ? (
					<table className="w-full text-sm border-collapse mb-6">
						<thead>
							<tr className="border-b-2 border-gray-200">
								<th className="text-left py-3 font-medium text-gray-700">Description</th>
								<th className="text-right py-3 font-medium text-gray-700">Qty</th>
								<th className="text-right py-3 font-medium text-gray-700">Unit price</th>
								<th className="text-right py-3 font-medium text-gray-700">Amount</th>
							</tr>
						</thead>
						<tbody>
							{invoice.lineItems.map((li) => (
								<tr key={li.id} className="border-b border-gray-100">
									<td className="py-3">{li.description}</td>
									<td className="py-3 text-right">{li.quantity}</td>
									<td className="py-3 text-right">{fmt(li.unitPriceCents)}</td>
									<td className="py-3 text-right">{fmt(li.amountCents)}</td>
								</tr>
							))}
						</tbody>
					</table>
				) : (
					<div className="mb-6">
						<p className="text-sm text-gray-600">
							{invoice.term ? `${invoice.term.name} ${invoice.term.year}` : "Invoice"} — {fmt(invoice.total)}
						</p>
					</div>
				)}

				{(invoice.discount > 0 || (invoice.tax ?? 0) > 0) && (
					<p className="text-sm text-gray-600 mb-4">
						{invoice.discount > 0 && <>Subtotal {fmt(invoice.amount)} − Discount {fmt(invoice.discount)}</>}
						{invoice.discount > 0 && (invoice.tax ?? 0) > 0 && " · "}
						{(invoice.tax ?? 0) > 0 && <>GST {fmt(invoice.tax!)}</>}
					</p>
				)}

				<div className="flex justify-end mb-8">
					<div className="text-right">
						<p className="text-sm text-gray-500">Total due</p>
						<p className="text-2xl font-semibold text-gray-900">{fmt(invoice.total)}</p>
						{paidTotal > 0 && (
							<p className="mt-1 text-sm text-green-600">
								Paid to date: {fmt(paidTotal)}
								{paidTotal < invoice.total && ` (${fmt(invoice.total - paidTotal)} remaining)`}
							</p>
						)}
					</div>
				</div>

				{invoice.notes && (
					<div className="mb-8 p-4 bg-gray-50 rounded-lg">
						<p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Notes</p>
						<p className="text-sm text-gray-700">{invoice.notes}</p>
					</div>
				)}

				<footer className="border-t border-gray-200 pt-6 text-sm text-gray-500">
					<p className="font-medium text-gray-700 mb-1">Payment instructions</p>
					<p>
						Please pay by the due date. Bank transfer and other payment methods can be arranged—contact us for details.
					</p>
				</footer>
			</article>
		</div>
	);
}
