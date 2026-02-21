import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/utils/auth";

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await params;
	const body = await request.json();
	const { status, notes, completedDate } = body;

	const existing = await prisma.checkIn.findFirst({
		where: { id, organisationId: ctx.organisationId },
	});
	if (!existing) {
		return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
	}

	const data: any = {};
	if (status) data.status = status;
	if (notes !== undefined) data.notes = notes;
	if (status === "COMPLETED") data.completedDate = completedDate ? new Date(completedDate) : new Date();

	const checkIn = await prisma.checkIn.update({ where: { id }, data });
	return NextResponse.json(checkIn);
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await params;
	const existing = await prisma.checkIn.findFirst({
		where: { id, organisationId: ctx.organisationId },
	});
	if (!existing) {
		return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
	}

	await prisma.checkIn.delete({ where: { id } });
	return NextResponse.json({ success: true });
}
