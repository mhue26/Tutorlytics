import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
	const session = await getServerSession(authOptions);
	const userId = (session?.user as any)?.id as string | undefined;
	if (!userId) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const memberships = await prisma.organisationMember.findMany({
		where: { userId },
		orderBy: { createdAt: "asc" },
		select: { organisationId: true, role: true },
	});

	return NextResponse.json(
		memberships.map((m) => ({ organisationId: m.organisationId, role: m.role }))
	);
}
