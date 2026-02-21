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
	const holidayId = parseInt(id);
	const body = await request.json();
	const { name, startDate, endDate, year } = body;

	if (!name || !startDate || !endDate || !year) {
		return NextResponse.json({ error: "Invalid data" }, { status: 400 });
	}

	const start = new Date(startDate);
	const end = new Date(endDate);
	if (start >= end) {
		return NextResponse.json({ error: "Start date must be before end date" }, { status: 400 });
	}

	const existing = await prisma.holiday.findFirst({
		where: { id: holidayId, organisationId: ctx.organisationId },
	});
	if (!existing) {
		return NextResponse.json({ error: "Holiday not found" }, { status: 404 });
	}

	const holiday = await prisma.holiday.update({
		where: { id: holidayId },
		data: { name, startDate: start, endDate: end, year },
	});

	return NextResponse.json(holiday);
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await params;
	const holidayId = parseInt(id);

	const existing = await prisma.holiday.findFirst({
		where: { id: holidayId, organisationId: ctx.organisationId },
	});
	if (!existing) {
		return NextResponse.json({ error: "Holiday not found" }, { status: 404 });
	}

	await prisma.holiday.delete({ where: { id: holidayId } });
	return NextResponse.json({ success: true });
}
