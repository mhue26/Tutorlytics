import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/utils/auth";

export async function GET(request: NextRequest) {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { searchParams } = new URL(request.url);
	const studentId = searchParams.get("studentId");

	const where: any = { organisationId: ctx.organisationId };
	if (studentId) where.studentId = parseInt(studentId);

	const assessments = await prisma.assessment.findMany({
		where,
		include: {
			student: { select: { id: true, firstName: true, lastName: true } },
			recordedBy: { select: { name: true } },
		},
		orderBy: { date: "desc" },
	});

	return NextResponse.json(assessments);
}

export async function POST(request: NextRequest) {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const body = await request.json();
	const { studentId, type, title, score, maxScore, grade, notes, date } = body;

	if (!studentId || !type || !title || !date) {
		return NextResponse.json({ error: "Student, type, title, and date are required" }, { status: 400 });
	}

	const student = await prisma.student.findFirst({
		where: { id: parseInt(studentId), organisationId: ctx.organisationId },
	});
	if (!student) {
		return NextResponse.json({ error: "Student not found" }, { status: 404 });
	}

	const assessment = await prisma.assessment.create({
		data: {
			type,
			title,
			score: score !== undefined && score !== "" ? parseFloat(score) : null,
			maxScore: maxScore !== undefined && maxScore !== "" ? parseFloat(maxScore) : null,
			grade: grade || null,
			notes: notes || null,
			date: new Date(date),
			organisationId: ctx.organisationId,
			studentId: parseInt(studentId),
			recordedById: ctx.userId,
		},
	});

	return NextResponse.json(assessment);
}
