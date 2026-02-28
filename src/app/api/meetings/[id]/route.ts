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
	const meetingId = parseInt(id, 10);
	if (Number.isNaN(meetingId)) {
		return NextResponse.json({ error: "Invalid meeting id" }, { status: 400 });
	}

	const where: { id: number; organisationId: string; createdById?: string } = {
		id: meetingId,
		organisationId: ctx.organisationId,
	};
	if (ctx.role === "TEACHER") where.createdById = ctx.userId;

	const meeting = await prisma.meeting.findFirst({
		where,
		include: { student: true },
	});
	if (!meeting) {
		return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
	}

	return NextResponse.json(meeting);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await params;
	const meetingId = parseInt(id, 10);
	if (Number.isNaN(meetingId)) {
		return NextResponse.json({ error: "Invalid meeting id" }, { status: 400 });
	}

	const where: { id: number; organisationId: string; createdById?: string } = {
		id: meetingId,
		organisationId: ctx.organisationId,
	};
	if (ctx.role === "TEACHER") where.createdById = ctx.userId;

	const existing = await prisma.meeting.findFirst({ where });
	if (!existing) {
		return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
	}

	const body = await request.json();
	const scope = (body.scope as string) || "this";

	if (scope === "future") {
		if (existing.recurrenceSeriesId == null) {
			return NextResponse.json(
				{ error: "Scope 'future' only applies to recurring events" },
				{ status: 400 }
			);
		}
		const updateData: Record<string, unknown> = {};
		if (typeof body.title === "string") updateData.title = body.title;
		if (typeof body.description === "string" || body.description === null)
			updateData.description = body.description;
		if (body.startTime != null) updateData.startTime = new Date(body.startTime);
		if (body.endTime != null) updateData.endTime = new Date(body.endTime);
		if (typeof body.isCompleted === "boolean") updateData.isCompleted = body.isCompleted;
		if (typeof body.meetingLocation === "string" || body.meetingLocation === null)
			updateData.meetingLocation = body.meetingLocation;
		const sid = typeof body.studentId === "number" ? body.studentId : parseInt(String(body.studentId), 10);
		if (!Number.isNaN(sid)) updateData.studentId = sid;

		await prisma.meeting.updateMany({
			where: {
				recurrenceSeriesId: existing.recurrenceSeriesId,
				recurrenceIndex: { gte: existing.recurrenceIndex ?? 0 },
				organisationId: ctx.organisationId,
			},
			data: updateData,
		});
		const updated = await prisma.meeting.findFirst({
			where: { id: meetingId },
			include: { student: true },
		});
		return NextResponse.json(updated);
	}

	// scope "this": update only this meeting; if recurring, optionally split from series
	const updateData: Record<string, unknown> = {};
	if (typeof body.title === "string") updateData.title = body.title;
	if (typeof body.description === "string" || body.description === null)
		updateData.description = body.description;
	if (body.startTime != null) updateData.startTime = new Date(body.startTime);
	if (body.endTime != null) updateData.endTime = new Date(body.endTime);
	if (typeof body.isCompleted === "boolean") updateData.isCompleted = body.isCompleted;
	if (typeof body.meetingLocation === "string" || body.meetingLocation === null)
		updateData.meetingLocation = body.meetingLocation;
	const sid = typeof body.studentId === "number" ? body.studentId : parseInt(String(body.studentId), 10);
	if (!Number.isNaN(sid)) updateData.studentId = sid;
	// When editing "this event only" and it's part of a series, detach from series so it's a one-off
	if (existing.recurrenceSeriesId != null) {
		updateData.recurrenceSeriesId = null;
		updateData.recurrenceIndex = null;
	}

	const updated = await prisma.meeting.update({
		where: { id: meetingId },
		data: updateData,
		include: { student: true },
	});
	return NextResponse.json(updated);
}
