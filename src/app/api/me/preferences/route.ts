import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/utils/auth";

function normalizeJsonObject(value: unknown): Record<string, unknown> {
	if (value && typeof value === "object" && !Array.isArray(value)) {
		return value as Record<string, unknown>;
	}
	return {};
}

export async function GET() {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const prefs = await prisma.userPreferences.findUnique({
		where: {
			userId_organisationId: {
				userId: ctx.userId,
				organisationId: ctx.organisationId,
			},
		},
		select: { studentsTablePrefsJson: true },
	});

	return NextResponse.json({
		studentsTablePrefs: normalizeJsonObject(prefs?.studentsTablePrefsJson ?? {}),
	});
}

export async function PUT(request: NextRequest) {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	let body: any = null;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const studentsTablePrefs = normalizeJsonObject(body?.studentsTablePrefs ?? body?.studentsTablePrefsJson);

	const next = await prisma.userPreferences.upsert({
		where: {
			userId_organisationId: {
				userId: ctx.userId,
				organisationId: ctx.organisationId,
			},
		},
		create: {
			userId: ctx.userId,
			organisationId: ctx.organisationId,
			studentsTablePrefsJson: studentsTablePrefs,
		},
		update: {
			studentsTablePrefsJson: studentsTablePrefs,
		},
		select: { studentsTablePrefsJson: true },
	});

	return NextResponse.json({
		studentsTablePrefs: normalizeJsonObject(next.studentsTablePrefsJson ?? {}),
	});
}

