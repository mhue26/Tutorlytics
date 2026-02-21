import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/utils/auth";

export async function POST(request: NextRequest) {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const body = await request.json();
	const { classId, scheduledDate, notes } = body;

	if (!classId || !scheduledDate) {
		return NextResponse.json({ error: "Class and date are required" }, { status: 400 });
	}

	const classData = await prisma.class.findFirst({
		where: { id: parseInt(classId), organisationId: ctx.organisationId },
		include: { students: { where: { isArchived: false }, select: { id: true } } },
	});

	if (!classData) {
		return NextResponse.json({ error: "Class not found" }, { status: 404 });
	}

	const checkIns = await prisma.checkIn.createMany({
		data: classData.students.map((student) => ({
			scheduledDate: new Date(scheduledDate),
			notes: notes || null,
			organisationId: ctx.organisationId,
			studentId: student.id,
			teacherId: ctx.userId,
		})),
	});

	return NextResponse.json({ created: checkIns.count });
}
