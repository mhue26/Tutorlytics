import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/utils/auth";

export async function POST(request: NextRequest) {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	let body: any = null;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const currentPassword = String(body?.currentPassword ?? "");
	const newPassword = String(body?.newPassword ?? "");

	if (!currentPassword) {
		return NextResponse.json({ error: "Current password is required" }, { status: 400 });
	}
	if (newPassword.length < 8) {
		return NextResponse.json(
			{ error: "New password must be at least 8 characters" },
			{ status: 400 }
		);
	}

	const user = await prisma.user.findUnique({
		where: { id: ctx.userId },
		select: { passwordHash: true },
	});

	if (!user || !user.passwordHash) {
		return NextResponse.json(
			{ error: "Password changes aren’t available for this account" },
			{ status: 400 }
		);
	}

	const ok = await bcrypt.compare(currentPassword, user.passwordHash);
	if (!ok) {
		return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
	}

	const nextHash = await bcrypt.hash(newPassword, 10);
	await prisma.user.update({
		where: { id: ctx.userId },
		data: { passwordHash: nextHash },
	});

	return NextResponse.json({ success: true });
}

