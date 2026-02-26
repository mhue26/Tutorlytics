"use server";

import { redirect } from "next/navigation";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";

const TEAM_ANCHOR = "/settings#team";

export async function inviteMember(formData: FormData) {
	const ctx = await requireOrgContext();
	if (ctx.role !== "OWNER" && ctx.role !== "ADMIN") return;

	const email = String(formData.get("email") || "")
		.trim()
		.toLowerCase();
	const role = String(formData.get("role") || "TEACHER") as "ADMIN" | "TEACHER";

	if (!email) return;

	const token = crypto.randomBytes(32).toString("hex");
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

	await prisma.invitation.create({
		data: {
			email,
			role,
			token,
			expiresAt,
			organisationId: ctx.organisationId,
			invitedById: ctx.userId,
		},
	});

	redirect(TEAM_ANCHOR);
}

export async function removeMember(formData: FormData) {
	const ctx = await requireOrgContext();
	if (ctx.role !== "OWNER") return;

	const memberId = String(formData.get("memberId") || "");
	if (!memberId) return;

	const member = await prisma.organisationMember.findFirst({
		where: { id: memberId, organisationId: ctx.organisationId },
	});
	if (!member || member.role === "OWNER") return;

	await prisma.organisationMember.delete({ where: { id: memberId } });
	redirect(TEAM_ANCHOR);
}

export async function updateRole(formData: FormData) {
	const ctx = await requireOrgContext();
	if (ctx.role !== "OWNER") return;

	const memberId = String(formData.get("memberId") || "");
	const newRole = String(formData.get("role") || "") as "ADMIN" | "TEACHER";
	if (!memberId || !newRole) return;

	const member = await prisma.organisationMember.findFirst({
		where: { id: memberId, organisationId: ctx.organisationId },
	});
	if (!member || member.role === "OWNER") return;

	await prisma.organisationMember.update({
		where: { id: memberId },
		data: { role: newRole },
	});
	redirect(TEAM_ANCHOR);
}

export async function cancelInvitation(formData: FormData) {
	const ctx = await requireOrgContext();
	if (ctx.role !== "OWNER" && ctx.role !== "ADMIN") return;

	const invitationId = String(formData.get("invitationId") || "");
	if (!invitationId) return;

	await prisma.invitation.delete({
		where: { id: invitationId, organisationId: ctx.organisationId },
	});
	redirect(TEAM_ANCHOR);
}

export async function generateJoinCode() {
	const ctx = await requireOrgContext();
	if (ctx.role !== "OWNER" && ctx.role !== "ADMIN") return;

	const joinCode = crypto.randomBytes(4).toString("hex");
	const joinCodeExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

	await prisma.organisation.update({
		where: { id: ctx.organisationId },
		data: { joinCode, joinCodeExpiresAt },
	});
	redirect(TEAM_ANCHOR);
}

export async function approveJoinRequest(formData: FormData) {
	const ctx = await requireOrgContext();
	if (ctx.role !== "OWNER" && ctx.role !== "ADMIN") return;

	const requestId = String(formData.get("requestId") || "");
	if (!requestId) return;

	const req = await prisma.organisationJoinRequest.findFirst({
		where: { id: requestId, organisationId: ctx.organisationId, status: "PENDING" },
	});
	if (!req) return;

	await prisma.$transaction([
		prisma.organisationMember.create({
			data: {
				userId: req.userId,
				organisationId: req.organisationId,
				role: req.role,
			},
		}),
		prisma.organisationJoinRequest.update({
			where: { id: requestId },
			data: { status: "APPROVED", decidedAt: new Date(), decidedById: ctx.userId },
		}),
	]);
	redirect(TEAM_ANCHOR);
}

export async function rejectJoinRequest(formData: FormData) {
	const ctx = await requireOrgContext();
	if (ctx.role !== "OWNER" && ctx.role !== "ADMIN") return;

	const requestId = String(formData.get("requestId") || "");
	if (!requestId) return;

	await prisma.organisationJoinRequest.updateMany({
		where: { id: requestId, organisationId: ctx.organisationId, status: "PENDING" },
		data: { status: "REJECTED", decidedAt: new Date(), decidedById: ctx.userId },
	});
	redirect(TEAM_ANCHOR);
}

