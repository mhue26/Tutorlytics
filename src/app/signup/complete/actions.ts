"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/lib/prisma";

function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 48);
}

export async function completeSignup(
	orgName: string
): Promise<{ organisationId?: string; role?: string; error?: string }> {
	const session = await getServerSession(authOptions);
	const userId = (session?.user as any)?.id as string | undefined;
	const needOrg = (session?.user as any)?.needOrg === true;

	if (!userId || !needOrg) {
		return { error: "Not allowed" };
	}

	const name = String(orgName || "").trim();
	if (!name) {
		return { error: "Organisation name is required" };
	}

	const existingMembership = await prisma.organisationMember.findFirst({
		where: { userId },
		select: { id: true },
	});
	const isFirstOrg = !existingMembership;

	let slug = generateSlug(name);
	const slugExists = await prisma.organisation.findUnique({ where: { slug } });
	if (slugExists) {
		slug = `${slug}-${Date.now().toString(36)}`;
	}

	const org = await prisma.organisation.create({
		data: { name, slug, ownerId: isFirstOrg ? userId : undefined },
	});

	await prisma.organisationMember.create({
		data: {
			userId,
			organisationId: org.id,
			role: "OWNER",
		},
	});

	return { organisationId: org.id, role: "OWNER" };
}

export async function requestToJoinByCode(
	code: string
): Promise<{ success?: boolean; error?: string }> {
	const session = await getServerSession(authOptions);
	const userId = (session?.user as any)?.id as string | undefined;
	if (!userId) {
		return { error: "You must be signed in to request to join." };
	}

	const trimmed = String(code || "").trim().toLowerCase();
	if (!trimmed) {
		return { error: "Please enter the join code." };
	}

	const org = await prisma.organisation.findFirst({
		where: {
			joinCode: { equals: trimmed, mode: "insensitive" },
			joinCodeExpiresAt: { gt: new Date() },
		},
	});
	if (!org) {
		return { error: "Invalid or expired code." };
	}

	const existingMember = await prisma.organisationMember.findUnique({
		where: {
			userId_organisationId: { userId, organisationId: org.id },
		},
	});
	if (existingMember) {
		return { error: "Already a member." };
	}

	const existingRequest = await prisma.organisationJoinRequest.findFirst({
		where: {
			userId,
			organisationId: org.id,
			status: "PENDING",
		},
	});
	if (existingRequest) {
		return { error: "Request already pending." };
	}

	await prisma.organisationJoinRequest.create({
		data: {
			userId,
			organisationId: org.id,
			status: "PENDING",
			role: "TEACHER",
		},
	});
	return { success: true };
}
