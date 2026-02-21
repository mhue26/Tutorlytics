import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import Link from "next/link";
import BillingClient from "./BillingClient";

export default async function BillingPage() {
	const ctx = await requireOrgContext();

	const [invoices, recentPayments, students, terms, settings] = await Promise.all([
		prisma.invoice.findMany({
			where: { organisationId: ctx.organisationId },
			include: {
				student: { select: { id: true, firstName: true, lastName: true } },
				term: { select: { id: true, name: true } },
				payments: { select: { amount: true } },
			},
			orderBy: { createdAt: "desc" },
		}),
		prisma.payment.findMany({
			where: { organisationId: ctx.organisationId },
			include: {
				student: { select: { firstName: true, lastName: true } },
				invoice: { select: { number: true } },
			},
			orderBy: { date: "desc" },
			take: 10,
		}),
		prisma.student.findMany({
			where: { organisationId: ctx.organisationId, isArchived: false },
			select: { id: true, firstName: true, lastName: true },
			orderBy: { firstName: "asc" },
		}),
		prisma.term.findMany({
			where: { organisationId: ctx.organisationId },
			orderBy: [{ year: "desc" }, { startDate: "desc" }],
		}),
		prisma.billingSettings.findUnique({
			where: { organisationId: ctx.organisationId },
		}),
	]);

	const outstanding = invoices
		.filter((inv) => ["DRAFT", "SENT", "PARTIALLY_PAID", "OVERDUE"].includes(inv.status))
		.reduce((sum, inv) => sum + inv.total - inv.payments.reduce((s, p) => s + p.amount, 0), 0);

	const totalRevenue = invoices
		.flatMap((inv) => inv.payments)
		.reduce((sum, p) => sum + p.amount, 0);

	const overdueCount = invoices.filter((inv) => inv.status === "OVERDUE").length;

	const canManage = ctx.role === "OWNER" || ctx.role === "ADMIN";

	return (
		<div className="space-y-6 pt-8 font-sans" style={{ fontFamily: "'Work Sans', sans-serif" }}>
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold text-[#3D4756]">Billing</h1>
				{canManage && (
					<Link
						href="/settings/billing"
						className="text-sm text-gray-500 hover:text-gray-700"
					>
						Billing Settings
					</Link>
				)}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-white rounded-2xl shadow-sm p-6">
					<div className="text-sm text-gray-500 mb-1">Outstanding</div>
					<div className="text-2xl font-semibold text-orange-600">
						${(outstanding / 100).toFixed(2)}
					</div>
				</div>
				<div className="bg-white rounded-2xl shadow-sm p-6">
					<div className="text-sm text-gray-500 mb-1">Total Revenue</div>
					<div className="text-2xl font-semibold text-green-600">
						${(totalRevenue / 100).toFixed(2)}
					</div>
				</div>
				<div className="bg-white rounded-2xl shadow-sm p-6">
					<div className="text-sm text-gray-500 mb-1">Overdue</div>
					<div className="text-2xl font-semibold text-red-600">{overdueCount}</div>
				</div>
			</div>

			<BillingClient
				invoices={invoices.map((inv) => ({
					id: inv.id,
					number: inv.number,
					amount: inv.amount,
					discount: inv.discount,
					total: inv.total,
					status: inv.status,
					dueDate: inv.dueDate?.toISOString() || null,
					notes: inv.notes,
					createdAt: inv.createdAt.toISOString(),
					student: inv.student,
					term: inv.term,
					paidAmount: inv.payments.reduce((s, p) => s + p.amount, 0),
				}))}
				recentPayments={recentPayments.map((p) => ({
					id: p.id,
					amount: p.amount,
					method: p.method,
					reference: p.reference,
					date: p.date.toISOString(),
					student: p.student,
					invoiceNumber: p.invoice?.number || null,
				}))}
				students={students}
				terms={terms.map((t) => ({ id: t.id, name: t.name, year: t.year }))}
				canManage={canManage}
				currency={settings?.currency || "AUD"}
			/>
		</div>
	);
}
