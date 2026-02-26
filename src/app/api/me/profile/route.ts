import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/utils/auth";

export async function PUT(request: NextRequest) {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	let body: any = null;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const name = String(body?.name ?? "").trim();
	const image = body?.image == null ? null : String(body.image).trim();
	const bio = body?.bio == null ? null : String(body.bio).trim();

	if (!name) {
		return NextResponse.json({ error: "Name is required" }, { status: 400 });
	}

	const updated = await prisma.user.update({
		where: { id: ctx.userId },
		data: {
			name,
			image: image || null,
			bio: bio || null,
		},
		select: { id: true, name: true, email: true, image: true, bio: true },
	});

	return NextResponse.json({ user: updated });
}

