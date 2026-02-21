import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, createPersonalWorkspaceIfMissing } from "@/utils/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
	const session = await getServerSession(authOptions);
	const userId = (session?.user as any)?.id as string | undefined;
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Ensure every user has a personal workspace so it appears in the list
	await createPersonalWorkspaceIfMissing(userId, (session?.user as any)?.name ?? null);

	const memberships = await prisma.organisationMember.findMany({
		where: { userId },
		orderBy: { createdAt: "asc" },
		select: {
			organisationId: true,
			role: true,
			organisation: {
				select: { name: true, ownerId: true },
			},
		},
	});

	const workspaces = memberships.map((m) => ({
		organisationId: m.organisationId,
		role: m.role,
		organisationName: m.organisation.name,
		isPersonal: m.organisation.ownerId === userId,
	}));

	// Personal first, then by name
	workspaces.sort((a, b) => {
		if (a.isPersonal && !b.isPersonal) return -1;
		if (!a.isPersonal && b.isPersonal) return 1;
		return a.organisationName.localeCompare(b.organisationName);
	});

	return NextResponse.json(workspaces);
}
