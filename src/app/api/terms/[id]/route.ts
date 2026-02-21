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
	const termId = parseInt(id);
	const body = await request.json();
	const { name, startDate, endDate, year, isActive } = body;

	if (!name || !startDate || !endDate || !year) {
		return NextResponse.json({ error: "Invalid data" }, { status: 400 });
	}

	const start = new Date(startDate);
	const end = new Date(endDate);
	if (start >= end) {
		return NextResponse.json({ error: "Start date must be before end date" }, { status: 400 });
	}

	const existingTerm = await prisma.term.findFirst({
		where: { id: termId, organisationId: ctx.organisationId },
	});
	if (!existingTerm) {
		return NextResponse.json({ error: "Term not found" }, { status: 404 });
	}

	const term = await prisma.term.update({
		where: { id: termId },
		data: { name, startDate: start, endDate: end, year, isActive: isActive ?? true },
	});

	return NextResponse.json(term);
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await params;
	const termId = parseInt(id);

	const existingTerm = await prisma.term.findFirst({
		where: { id: termId, organisationId: ctx.organisationId },
	});
	if (!existingTerm) {
		return NextResponse.json({ error: "Term not found" }, { status: 404 });
	}

	await prisma.term.delete({ where: { id: termId } });
	return NextResponse.json({ success: true });
}
