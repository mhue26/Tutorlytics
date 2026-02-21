import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import Link from "next/link";
import crypto from "crypto";
import MembersClient from "./MembersClient";

async function inviteMember(formData: FormData) {
	"use server";
	const ctx = await requireOrgContext();
	if (ctx.role !== "OWNER" && ctx.role !== "ADMIN") return;

	const email = String(formData.get("email") || "").trim().toLowerCase();
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

	redirect("/settings/members");
}

async function removeMember(formData: FormData) {
	"use server";
	const ctx = await requireOrgContext();
	if (ctx.role !== "OWNER") return;

	const memberId = String(formData.get("memberId") || "");
	if (!memberId) return;

	const member = await prisma.organisationMember.findFirst({
		where: { id: memberId, organisationId: ctx.organisationId },
	});
	if (!member || member.role === "OWNER") return;

	await prisma.organisationMember.delete({ where: { id: memberId } });
	redirect("/settings/members");
}

async function updateRole(formData: FormData) {
	"use server";
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
	redirect("/settings/members");
}

async function cancelInvitation(formData: FormData) {
	"use server";
	const ctx = await requireOrgContext();
	if (ctx.role !== "OWNER" && ctx.role !== "ADMIN") return;

	const invitationId = String(formData.get("invitationId") || "");
	if (!invitationId) return;

	await prisma.invitation.delete({
		where: { id: invitationId, organisationId: ctx.organisationId },
	});
	redirect("/settings/members");
}

async function generateJoinCode() {
	"use server";
	const ctx = await requireOrgContext();
	if (ctx.role !== "OWNER" && ctx.role !== "ADMIN") return;

	const joinCode = crypto.randomBytes(4).toString("hex");
	const joinCodeExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

	await prisma.organisation.update({
		where: { id: ctx.organisationId },
		data: { joinCode, joinCodeExpiresAt },
	});
	redirect("/settings/members");
}

async function approveJoinRequest(formData: FormData) {
	"use server";
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
	redirect("/settings/members");
}

async function rejectJoinRequest(formData: FormData) {
	"use server";
	const ctx = await requireOrgContext();
	if (ctx.role !== "OWNER" && ctx.role !== "ADMIN") return;

	const requestId = String(formData.get("requestId") || "");
	if (!requestId) return;

	await prisma.organisationJoinRequest.updateMany({
		where: { id: requestId, organisationId: ctx.organisationId, status: "PENDING" },
		data: { status: "REJECTED", decidedAt: new Date(), decidedById: ctx.userId },
	});
	redirect("/settings/members");
}

export default async function MembersPage() {
	const ctx = await requireOrgContext();

	const [org, members, pendingInvitations, pendingJoinRequests] = await Promise.all([
		prisma.organisation.findUnique({
			where: { id: ctx.organisationId },
			select: { joinCode: true, joinCodeExpiresAt: true },
		}),
		prisma.organisationMember.findMany({
			where: { organisationId: ctx.organisationId },
			include: { user: { select: { id: true, name: true, email: true, image: true } } },
			orderBy: { createdAt: "asc" },
		}),
		prisma.invitation.findMany({
			where: {
				organisationId: ctx.organisationId,
				acceptedAt: null,
				expiresAt: { gt: new Date() },
			},
			orderBy: { createdAt: "desc" },
		}),
		prisma.organisationJoinRequest.findMany({
			where: { organisationId: ctx.organisationId, status: "PENDING" },
			include: { user: { select: { id: true, name: true, email: true } } },
			orderBy: { createdAt: "desc" },
		}),
	]);

	return (
		<div className="space-y-6 pt-8" style={{ fontFamily: "'Work Sans', sans-serif" }}>
			<div className="flex items-center gap-3">
				<Link href="/settings" className="text-sm text-gray-500 hover:text-gray-700">Settings</Link>
				<span className="text-gray-400">/</span>
				<h1 className="text-2xl font-semibold text-[#3D4756]">Team Members</h1>
			</div>

			<MembersClient
				members={members.map((m) => ({
					id: m.id,
					role: m.role,
					userId: m.userId,
					user: m.user,
				}))}
				pendingInvitations={pendingInvitations.map((inv) => ({
					id: inv.id,
					email: inv.email,
					role: inv.role,
					token: inv.token,
					expiresAt: inv.expiresAt.toISOString(),
				}))}
				joinCode={org?.joinCode ?? null}
				joinCodeExpiresAt={org?.joinCodeExpiresAt?.toISOString() ?? null}
				pendingJoinRequests={pendingJoinRequests.map((r) => ({
					id: r.id,
					userId: r.userId,
					role: r.role,
					createdAt: r.createdAt.toISOString(),
					user: r.user,
				}))}
				currentUserId={ctx.userId}
				currentRole={ctx.role}
				inviteAction={inviteMember}
				removeAction={removeMember}
				updateRoleAction={updateRole}
				cancelInvitationAction={cancelInvitation}
				generateJoinCodeAction={generateJoinCode}
				approveJoinRequestAction={approveJoinRequest}
				rejectJoinRequestAction={rejectJoinRequest}
			/>
		</div>
	);
}
