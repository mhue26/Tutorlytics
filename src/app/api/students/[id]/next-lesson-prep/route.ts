import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/utils/auth";

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await params;
	const studentId = parseInt(id, 10);
	if (Number.isNaN(studentId)) {
		return NextResponse.json({ error: "Invalid student id" }, { status: 400 });
	}

	const where: {
		organisationId: string;
		studentId: number;
		status: "COMPLETED";
		nextLessonPrep: { not: null };
		createdById?: string;
	} = {
		organisationId: ctx.organisationId,
		studentId,
		status: "COMPLETED",
		nextLessonPrep: { not: null },
	};
	if (ctx.role === "TEACHER") where.createdById = ctx.userId;

	const lastCompleted = await prisma.meeting.findFirst({
		where,
		orderBy: { startTime: "desc" },
		select: { nextLessonPrep: true },
	});

	return NextResponse.json({
		nextLessonPrep: (lastCompleted?.nextLessonPrep ?? "").trim() || null,
	});
}
