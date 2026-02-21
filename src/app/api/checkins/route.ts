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
	if (ctx.role === "TEACHER") where.teacherId = ctx.userId;

	const checkIns = await prisma.checkIn.findMany({
		where,
		include: { student: { select: { id: true, firstName: true, lastName: true } } },
		orderBy: { scheduledDate: "desc" },
	});

	return NextResponse.json(checkIns);
}

export async function POST(request: NextRequest) {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const body = await request.json();
	const { studentId, scheduledDate, notes } = body;

	if (!studentId || !scheduledDate) {
		return NextResponse.json({ error: "Student and date are required" }, { status: 400 });
	}

	const student = await prisma.student.findFirst({
		where: { id: parseInt(studentId), organisationId: ctx.organisationId },
	});
	if (!student) {
		return NextResponse.json({ error: "Student not found" }, { status: 404 });
	}

	const checkIn = await prisma.checkIn.create({
		data: {
			scheduledDate: new Date(scheduledDate),
			notes: notes || null,
			organisationId: ctx.organisationId,
			studentId: parseInt(studentId),
			teacherId: ctx.userId,
		},
	});

	return NextResponse.json(checkIn);
}
