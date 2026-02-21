import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/utils/auth";

export async function GET() {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const holidays = await prisma.holiday.findMany({
		where: { organisationId: ctx.organisationId },
		orderBy: [{ year: "desc" }, { startDate: "asc" }],
	});

	return NextResponse.json(holidays);
}

export async function POST(request: NextRequest) {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const body = await request.json();
	const { name, startDate, endDate, year, color } = body;

	if (!name || !startDate || !endDate || !year) {
		return NextResponse.json({ error: "Invalid data" }, { status: 400 });
	}

	const start = new Date(startDate);
	const end = new Date(endDate);
	if (start >= end) {
		return NextResponse.json({ error: "Start date must be before end date" }, { status: 400 });
	}

	const holiday = await prisma.holiday.create({
		data: {
			name,
			startDate: start,
			endDate: end,
			year,
			color: color || "#F59E0B",
			organisationId: ctx.organisationId,
		},
	});

	return NextResponse.json(holiday);
}
