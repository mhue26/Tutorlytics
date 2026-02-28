"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface InvoiceDetailClientProps {
	invoice: {
		id: string;
		number: string;
		amount: number;
		discount: number;
		tax: number;
		total: number;
		status: string;
		dueDate: string | null;
		notes: string | null;
		createdAt: string;
		student: { id: number; firstName: string; lastName: string; email: string | null };
		term: { id: number; name: string; year: number } | null;
		payments: {
			id: string;
			amount: number;
			method: string;
			reference: string | null;
			date: string;
			notes: string | null;
		}[];
		lineItems?: {
			id: string;
			description: string;
			quantity: number;
			unitPriceCents: number;
			amountCents: number;
		}[];
	};
	canManage: boolean;
}

const statusColors: Record<string, string> = {
	DRAFT: "bg-gray-100 text-gray-800",
	SENT: "bg-blue-100 text-blue-800",
	PAID: "bg-green-100 text-green-800",
	PARTIALLY_PAID: "bg-yellow-100 text-yellow-800",
	OVERDUE: "bg-red-100 text-red-800",
	CANCELLED: "bg-gray-100 text-gray-500",
};

const methodLabels: Record<string, string> = {
	CASH: "Cash",
	BANK_TRANSFER: "Bank Transfer",
	CARD: "Card",
	OTHER: "Other",
};

export default function InvoiceDetailClient({
	invoice: initialInvoice,
	canManage,
}: InvoiceDetailClientProps) {
	const router = useRouter();
	const [invoice, setInvoice] = useState(initialInvoice);
	const [editing, setEditing] = useState(false);
	const [form, setForm] = useState({
		total: (initialInvoice.total / 100).toFixed(2),
		dueDate: initialInvoice.dueDate
			? initialInvoice.dueDate.slice(0, 10)
			: "",
		notes: initialInvoice.notes ?? "",
	});
	const [loading, setLoading] = useState(false);
	const [deleteConfirm, setDeleteConfirm] = useState(false);
	const [sendError, setSendError] = useState<string | null>(null);
	const [payNowLoading, setPayNowLoading] = useState(false);

	const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;
	const paidTotal = invoice.payments.reduce((s, p) => s + p.amount, 0);
	const isDraft = invoice.status === "DRAFT";

	const handleSave = async () => {
		if (!canManage || !isDraft) return;
		setLoading(true);
		const res = await fetch(`/api/invoices/${invoice.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				total: Math.round(parseFloat(form.total) * 100),
				dueDate: form.dueDate || null,
				notes: form.notes || null,
			}),
		});
		if (res.ok) {
			const updated = await res.json();
			setInvoice({
				...invoice,
				...updated,
				dueDate: updated.dueDate ?? null,
				notes: updated.notes,
				payments: invoice.payments,
			});
			setEditing(false);
		}
		setLoading(false);
		router.refresh();
	};

	const handleStatus = async (status: string) => {
		if (!canManage) return;
		setLoading(true);
		await fetch(`/api/invoices/${invoice.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ status }),
		});
		setInvoice((prev) => ({ ...prev, status }));
		setLoading(false);
		router.refresh();
	};

	const handleDelete = async () => {
		if (!canManage || !isDraft || !deleteConfirm) return;
		setLoading(true);
		const res = await fetch(`/api/invoices/${invoice.id}`, { method: "DELETE" });
		if (res.ok) {
			router.push("/billing");
			router.refresh();
			return;
		}
		setLoading(false);
	};

	const handlePayNow = async () => {
		setPayNowLoading(true);
		const res = await fetch(`/api/invoices/${invoice.id}/create-checkout`, { method: "POST" });
		const data = await res.json().catch(() => ({}));
		if (res.ok && data.url) {
			window.location.href = data.url;
		} else {
			setSendError(data.error ?? "Could not start payment");
			setPayNowLoading(false);
		}
	};

	const handleSend = async () => {
		if (!canManage || !isDraft) return;
		setSendError(null);
		setLoading(true);
		const res = await fetch(`/api/invoices/${invoice.id}/send`, { method: "POST" });
		const data = await res.json().catch(() => ({}));
		if (res.ok) {
			setInvoice((prev) => ({ ...prev, status: "SENT" }));
			router.refresh();
		} else {
			setSendError(data.error ?? "Failed to send email");
		}
		setLoading(false);
	};

	return (
		<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
			<div className="p-6 space-y-6">
				{/* Header row */}
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<span
							className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
								statusColors[invoice.status] ?? ""
							}`}
						>
							{invoice.status.replace("_", " ")}
						</span>
						<p className="mt-2 text-sm text-gray-500">
							{invoice.student.firstName} {invoice.student.lastName}
							{invoice.term && (
								<>
									{" · "}
									{invoice.term.name} {invoice.term.year}
								</>
							)}
						</p>
					</div>
					<div className="text-right flex flex-col items-end gap-1">
						<div className="text-2xl font-semibold text-[#3D4756]">{fmt(invoice.total)}</div>
						<Link
							href={`/billing/invoices/${invoice.id}/print`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm font-medium text-[#3D4756] hover:text-[#2A3441] hover:underline"
						>
							Print / PDF
						</Link>
						{(invoice.discount > 0 || invoice.tax > 0) && (
							<div className="text-sm text-gray-500">
								{invoice.discount > 0 && <>Subtotal {fmt(invoice.amount)} − Discount {fmt(invoice.discount)}</>}
								{invoice.discount > 0 && invoice.tax > 0 && " · "}
								{invoice.tax > 0 && <>GST {fmt(invoice.tax)}</>}
							</div>
						)}
					</div>
				</div>

				{/* Line items */}
				{invoice.lineItems && invoice.lineItems.length > 0 && (
					<div className="border-t border-gray-200 pt-6">
						<h2 className="text-base font-semibold text-gray-900 mb-3">Line items</h2>
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b text-left text-gray-500">
									<th className="pb-2 font-medium">Description</th>
									<th className="pb-2 font-medium text-right">Qty</th>
									<th className="pb-2 font-medium text-right">Unit price</th>
									<th className="pb-2 font-medium text-right">Amount</th>
								</tr>
							</thead>
							<tbody>
								{invoice.lineItems.map((li) => (
									<tr key={li.id} className="border-b border-gray-100">
										<td className="py-2">{li.description}</td>
										<td className="py-2 text-right">{li.quantity}</td>
										<td className="py-2 text-right">{fmt(li.unitPriceCents)}</td>
										<td className="py-2 text-right">{fmt(li.amountCents)}</td>
									</tr>
								))}
							</tbody>
						</table>
						{(invoice.discount > 0 || invoice.tax > 0) && (
							<div className="mt-2 text-sm text-gray-600">
								{invoice.discount > 0 && <>Subtotal {fmt(invoice.amount)} − Discount {fmt(invoice.discount)}</>}
								{invoice.tax > 0 && <> + GST {fmt(invoice.tax)}</>}
								{" "}= {fmt(invoice.total)}
							</div>
						)}
					</div>
				)}

				{/* Editable fields for DRAFT */}
				{isDraft && canManage && (
					<div className="border-t border-gray-200 pt-6 space-y-4">
						{editing ? (
							<>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Total amount ($)
										</label>
										<input
											type="number"
											step="0.01"
											min="0"
											value={form.total}
											onChange={(e) => setForm((f) => ({ ...f, total: e.target.value }))}
											className="w-full border rounded-lg px-3 py-2 text-sm"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Due date
										</label>
										<input
											type="date"
											value={form.dueDate}
											onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
											className="w-full border rounded-lg px-3 py-2 text-sm"
										/>
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
									<textarea
										value={form.notes}
										onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
										rows={2}
										className="w-full border rounded-lg px-3 py-2 text-sm"
									/>
								</div>
								<div className="flex gap-2">
									<button
										onClick={handleSave}
										disabled={loading}
										className="bg-[#3D4756] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2A3441] disabled:opacity-50"
									>
										{loading ? "Saving…" : "Save changes"}
									</button>
									<button
										onClick={() => setEditing(false)}
										className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
									>
										Cancel
									</button>
								</div>
							</>
						) : (
							<div className="flex flex-wrap gap-2 items-center">
								<button
									onClick={() => setEditing(true)}
									className="text-sm font-medium text-[#3D4756] hover:text-[#2A3441]"
								>
									Edit invoice
								</button>
								<button
									onClick={handleSend}
									disabled={loading}
									className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
								>
									{loading ? "Sending…" : "Send by email"}
								</button>
								<button
									onClick={() => handleStatus("SENT")}
									disabled={loading}
									className="border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
								>
									Mark as sent
								</button>
								{!deleteConfirm ? (
									<button
										onClick={() => setDeleteConfirm(true)}
										className="text-red-600 hover:text-red-700 text-sm font-medium"
									>
										Delete draft
									</button>
								) : (
									<span className="flex items-center gap-2">
										<button
											onClick={handleDelete}
											disabled={loading}
											className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
										>
											Confirm delete
										</button>
										<button
											onClick={() => setDeleteConfirm(false)}
											className="text-gray-500 text-sm"
										>
											Cancel
										</button>
									</span>
								)}
								{sendError && (
									<span className="text-sm text-red-600">{sendError}</span>
								)}
							</div>
						)}
					</div>
				)}

				{/* Due date & notes (read-only when not editing) */}
				{(!isDraft || !editing) && (invoice.dueDate || invoice.notes) && (
					<div className="border-t border-gray-200 pt-6 space-y-1 text-sm text-gray-600">
						{invoice.dueDate && (
							<p>
								<strong>Due date:</strong>{" "}
								{new Date(invoice.dueDate).toLocaleDateString("en-GB", {
									day: "numeric",
									month: "long",
									year: "numeric",
								})}
							</p>
						)}
						{invoice.notes && (
							<p>
								<strong>Notes:</strong> {invoice.notes}
							</p>
						)}
					</div>
				)}

				{/* Payments */}
				<div className="border-t border-gray-200 pt-6">
					<h2 className="text-base font-semibold text-gray-900 mb-3">Payments</h2>
					{invoice.payments.length > 0 ? (
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b text-left text-gray-500">
									<th className="pb-2 font-medium">Date</th>
									<th className="pb-2 font-medium text-right">Amount</th>
									<th className="pb-2 font-medium">Method</th>
									<th className="pb-2 font-medium">Reference</th>
								</tr>
							</thead>
							<tbody>
								{invoice.payments.map((p) => (
									<tr key={p.id} className="border-b border-gray-100">
										<td className="py-2">
											{new Date(p.date).toLocaleDateString("en-GB", {
												day: "numeric",
												month: "short",
												year: "numeric",
											})}
										</td>
										<td className="py-2 text-right font-medium text-green-600">
											{fmt(p.amount)}
										</td>
										<td className="py-2">{methodLabels[p.method] ?? p.method}</td>
										<td className="py-2 text-gray-500">{p.reference ?? "—"}</td>
									</tr>
								))}
							</tbody>
						</table>
					) : (
						<p className="text-sm text-gray-500">No payments recorded.</p>
					)}
					<div className="mt-2 text-sm font-medium text-gray-700">
						Paid: {fmt(paidTotal)} {invoice.status !== "PAID" && paidTotal < invoice.total && `/ ${fmt(invoice.total)}`}
					</div>
					{invoice.status !== "PAID" && invoice.status !== "CANCELLED" && (
						<div className="mt-3 flex flex-wrap gap-3">
							<button
								type="button"
								onClick={handlePayNow}
								disabled={payNowLoading || paidTotal >= invoice.total}
								className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:pointer-events-none"
							>
								{payNowLoading ? "Redirecting…" : "Pay now (card)"}
							</button>
							{canManage && (
								<Link
									href="/billing"
									className="inline-flex items-center text-sm font-medium text-[#3D4756] hover:text-[#2A3441]"
								>
									Record payment manually →
								</Link>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
