"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";

const BILLING_ANCHOR = "/settings#billing";

export async function saveBillingSettings(formData: FormData) {
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

	redirect(BILLING_ANCHOR);
}

export async function addDiscount(formData: FormData) {
	const ctx = await requireOrgContext();
	if (ctx.role !== "OWNER" && ctx.role !== "ADMIN") return;

	const name = String(formData.get("name") || "").trim();
	const type = String(formData.get("type") || "PERCENTAGE") as
		| "PERCENTAGE"
		| "FIXED";
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

	redirect(BILLING_ANCHOR);
}

export async function deleteDiscount(formData: FormData) {
	const ctx = await requireOrgContext();
	if (ctx.role !== "OWNER" && ctx.role !== "ADMIN") return;

	const discountId = String(formData.get("discountId") || "");
	if (!discountId) return;

	await prisma.discount.delete({ where: { id: discountId } });
	redirect(BILLING_ANCHOR);
}

