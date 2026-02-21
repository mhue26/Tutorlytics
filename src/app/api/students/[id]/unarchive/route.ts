import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/utils/auth";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await params;
	const studentId = parseInt(id);
	if (isNaN(studentId)) {
		return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
	}

	const student = await prisma.student.findFirst({
		where: { id: studentId, organisationId: ctx.organisationId },
	});
	if (!student) {
		return NextResponse.json({ error: "Student not found" }, { status: 404 });
	}

	await prisma.student.update({
		where: { id: studentId },
		data: { isArchived: false },
	});

	return NextResponse.json({ success: true });
}
