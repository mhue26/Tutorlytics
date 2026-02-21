import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import Link from "next/link";

async function saveBillingSettings(formData: FormData) {
	"use server";
	const ctx = await requireOrgContext();
	if (ctx.role !== "OWNER" && ctx.role !== "ADMIN") return;

	const defaultTermRate = parseFloat(String(formData.get("defaultTermRate") || "0"));
	const currency = String(formData.get("currency") || "AUD").trim();

	await prisma.billingSettings.upsert({
		where: { organisationId: ctx.organisationId },
		create: {
			organisationId: ctx.organisationId,
			defaultTermRateCents: Math.round(defaultTermRate * 100),
			currency,
		},
		update: {
			defaultTermRateCents: Math.round(defaultTermRate * 100),
			currency,
		},
	});

	redirect("/settings/billing");
}

async function addDiscount(formData: FormData) {
	"use server";
	const ctx = await requireOrgContext();
	if (ctx.role !== "OWNER" && ctx.role !== "ADMIN") return;

	const name = String(formData.get("name") || "").trim();
	const type = String(formData.get("type") || "PERCENTAGE") as "PERCENTAGE" | "FIXED";
	const value = parseFloat(String(formData.get("value") || "0"));
	if (!name || !value) return;

	let settings = await prisma.billingSettings.findUnique({
		where: { organisationId: ctx.organisationId },
	});

	if (!settings) {
		settings = await prisma.billingSettings.create({
			data: {
				organisationId: ctx.organisationId,
				defaultTermRateCents: 0,
				currency: "AUD",
			},
		});
	}

	await prisma.discount.create({
		data: {
			name,
			type,
			value: type === "FIXED" ? Math.round(value * 100) : value,
			billingSettingsId: settings.id,
		},
	});

	redirect("/settings/billing");
}

async function deleteDiscount(formData: FormData) {
	"use server";
	const ctx = await requireOrgContext();
	if (ctx.role !== "OWNER" && ctx.role !== "ADMIN") return;

	const discountId = String(formData.get("discountId") || "");
	if (!discountId) return;

	await prisma.discount.delete({ where: { id: discountId } });
	redirect("/settings/billing");
}

export default async function BillingSettingsPage() {
	const ctx = await requireOrgContext();

	const settings = await prisma.billingSettings.findUnique({
		where: { organisationId: ctx.organisationId },
		include: { discounts: { orderBy: { createdAt: "asc" } } },
	});

	const canEdit = ctx.role === "OWNER" || ctx.role === "ADMIN";
	const defaultRate = settings ? (settings.defaultTermRateCents / 100).toFixed(2) : "0.00";

	return (
		<div className="space-y-6 pt-8" style={{ fontFamily: "'Work Sans', sans-serif" }}>
			<div className="flex items-center gap-3">
				<Link href="/settings" className="text-sm text-gray-500 hover:text-gray-700">Settings</Link>
				<span className="text-gray-400">/</span>
				<h1 className="text-2xl font-semibold text-[#3D4756]">Billing Settings</h1>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="bg-white rounded-2xl shadow-sm p-6">
					<h2 className="text-lg font-medium text-gray-900 mb-4">Default Term Rate</h2>
					<form action={saveBillingSettings} className="space-y-4">
						<label className="block">
							<div className="text-sm font-medium text-gray-700">Rate per term ($)</div>
							<input
								name="defaultTermRate"
								type="number"
								step="0.01"
								min="0"
								defaultValue={defaultRate}
								disabled={!canEdit}
								className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#584b53] disabled:bg-gray-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
							/>
						</label>
						<label className="block">
							<div className="text-sm font-medium text-gray-700">Currency</div>
							<select
								name="currency"
								defaultValue={settings?.currency || "AUD"}
								disabled={!canEdit}
								className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#584b53] disabled:bg-gray-50"
							>
								<option value="AUD">AUD - Australian Dollar</option>
								<option value="USD">USD - US Dollar</option>
								<option value="GBP">GBP - British Pound</option>
								<option value="EUR">EUR - Euro</option>
								<option value="NZD">NZD - New Zealand Dollar</option>
							</select>
						</label>
						{canEdit && (
							<button
								type="submit"
								className="bg-[#3D4756] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2A3441] transition-colors"
							>
								Save
							</button>
						)}
					</form>
				</div>

				<div className="bg-white rounded-2xl shadow-sm p-6">
					<h2 className="text-lg font-medium text-gray-900 mb-4">Discounts</h2>

					{settings?.discounts && settings.discounts.length > 0 ? (
						<div className="space-y-2 mb-4">
							{settings.discounts.map((d) => (
								<div key={d.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
									<div>
										<span className="text-sm font-medium text-gray-900">{d.name}</span>
										<span className="text-xs text-gray-500 ml-2">
											{d.type === "PERCENTAGE" ? `${d.value}%` : `$${(d.value / 100).toFixed(2)}`}
										</span>
									</div>
									{canEdit && (
										<form action={deleteDiscount}>
											<input type="hidden" name="discountId" value={d.id} />
											<button type="submit" className="text-red-500 hover:text-red-700 text-xs">
												Remove
											</button>
										</form>
									)}
								</div>
							))}
						</div>
					) : (
						<p className="text-sm text-gray-500 mb-4">No discounts configured yet.</p>
					)}

					{canEdit && (
						<form action={addDiscount} className="space-y-3 pt-3 border-t border-gray-100">
							<input
								name="name"
								required
								placeholder="Discount name (e.g. Sibling Discount)"
								className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#584b53]"
							/>
							<div className="grid grid-cols-2 gap-3">
								<select
									name="type"
									className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#584b53]"
								>
									<option value="PERCENTAGE">Percentage (%)</option>
									<option value="FIXED">Fixed amount ($)</option>
								</select>
								<input
									name="value"
									type="number"
									step="0.01"
									min="0"
									required
									placeholder="Value"
									className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#584b53] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
								/>
							</div>
							<button
								type="submit"
								className="bg-[#3D4756] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2A3441] transition-colors"
							>
								Add discount
							</button>
						</form>
					)}
				</div>
			</div>
		</div>
	);
}
