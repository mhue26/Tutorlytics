import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/utils/auth";

function normalizeSubjects(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value
			.map((v) => String(v).trim())
			.filter(Boolean);
	}
	return [];
}

function normalizeColors(value: unknown): Record<string, string> {
	if (value && typeof value === "object" && !Array.isArray(value)) {
		const out: Record<string, string> = {};
		for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
			const key = String(k).trim();
			const val = String(v).trim();
			if (key) out[key] = val;
		}
		return out;
	}
	return {};
}

function parseSubjectList(subjectsStr: string): string[] {
	return (subjectsStr || "")
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
}

export async function GET() {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const [prefs, students] = await Promise.all([
		prisma.organisationPreferences.findUnique({
			where: { organisationId: ctx.organisationId },
			select: {
				defaultStudentRateCents: true,
				defaultSubjects: true,
				subjectColorsJson: true,
			},
		}),
		prisma.student.findMany({
			where: { organisationId: ctx.organisationId },
			select: { subjects: true },
		}),
	]);

	const subjectsInUse = Array.from(
		new Set(
			students.flatMap((s) => parseSubjectList(s.subjects ?? ""))
		)
	).sort((a, b) => a.localeCompare(b));

	return NextResponse.json({
		defaultStudentRateCents: prefs?.defaultStudentRateCents ?? null,
		defaultSubjects: normalizeSubjects(prefs?.defaultSubjects ?? []),
		subjectColors: normalizeColors(prefs?.subjectColorsJson ?? {}),
		subjectsInUse,
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

	const defaultStudentRateCentsRaw = body?.defaultStudentRateCents;
	const defaultStudentRateCents =
		defaultStudentRateCentsRaw == null || defaultStudentRateCentsRaw === ""
			? null
			: Number(defaultStudentRateCentsRaw);

	if (defaultStudentRateCents != null) {
		if (!Number.isFinite(defaultStudentRateCents) || defaultStudentRateCents < 0) {
			return NextResponse.json(
				{ error: "defaultStudentRateCents must be a non-negative number" },
				{ status: 400 }
			);
		}
	}

	const defaultSubjects = body?.defaultSubjects;
	const subjectColors = body?.subjectColors ?? body?.subjectColorsJson;

	const next = await prisma.organisationPreferences.upsert({
		where: { organisationId: ctx.organisationId },
		create: {
			organisationId: ctx.organisationId,
			defaultStudentRateCents:
				defaultStudentRateCents == null ? null : Math.round(defaultStudentRateCents),
			defaultSubjects: defaultSubjects == null ? undefined : normalizeSubjects(defaultSubjects),
			subjectColorsJson: subjectColors == null ? undefined : normalizeColors(subjectColors),
		},
		update: {
			defaultStudentRateCents:
				defaultStudentRateCents == null ? null : Math.round(defaultStudentRateCents),
			...(defaultSubjects == null ? {} : { defaultSubjects: normalizeSubjects(defaultSubjects) }),
			...(subjectColors == null ? {} : { subjectColorsJson: normalizeColors(subjectColors) }),
		},
		select: {
			defaultStudentRateCents: true,
			defaultSubjects: true,
			subjectColorsJson: true,
		},
	});

	return NextResponse.json({
		defaultStudentRateCents: next.defaultStudentRateCents ?? null,
		defaultSubjects: normalizeSubjects(next.defaultSubjects ?? []),
		subjectColors: normalizeColors(next.subjectColorsJson ?? {}),
	});
}

