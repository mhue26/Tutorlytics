import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/utils/auth";

type RecurringScope = "this" | "all" | "future";

function parseRecurringScope(value: unknown): RecurringScope | null {
	if (value === "this" || value === "all" || value === "future") return value;
	return null;
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await params;
	const body = await request.json();
	const { status, notes, completedDate } = body;
	const rawScope = body.scope ?? "this";
	const scope = parseRecurringScope(rawScope);
	if (!scope) {
		return NextResponse.json({ error: "Invalid scope" }, { status: 400 });
	}

	const existing = await prisma.checkIn.findFirst({
		where: { id, organisationId: ctx.organisationId },
	});
	if (!existing) {
		return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
	}

	const parsedScheduledDate = body.scheduledDate != null ? new Date(body.scheduledDate) : null;
	if (parsedScheduledDate != null && Number.isNaN(parsedScheduledDate.getTime())) {
		return NextResponse.json({ error: "Invalid scheduledDate" }, { status: 400 });
	}

	const sharedData: Record<string, unknown> = {};
	if (status) sharedData.status = status;
	if (notes !== undefined) sharedData.notes = notes;
	if (status === "COMPLETED") {
		sharedData.completedDate = completedDate ? new Date(completedDate) : new Date();
	}

	if (scope === "all" || scope === "future") {
		if (existing.ruleId == null) {
			return NextResponse.json(
				{ error: "Scope 'all' and 'future' only apply to recurring events" },
				{ status: 400 }
			);
		}

		const where: {
			organisationId: string;
			ruleId: string;
			scheduledDate?: { gte: Date };
		} = {
			organisationId: ctx.organisationId,
			ruleId: existing.ruleId,
		};
		if (scope === "future") {
			where.scheduledDate = { gte: existing.scheduledDate };
		}

		const targets = await prisma.checkIn.findMany({
			where,
			select: { id: true, scheduledDate: true },
			orderBy: { scheduledDate: "asc" },
		});

		const scheduledDeltaMs =
			parsedScheduledDate != null
				? parsedScheduledDate.getTime() - existing.scheduledDate.getTime()
				: null;
		const shouldShiftScheduled = scheduledDeltaMs != null;

		if (!shouldShiftScheduled) {
			if (Object.keys(sharedData).length > 0) {
				await prisma.checkIn.updateMany({
					where,
					data: sharedData,
				});
			}
		} else {
			await prisma.$transaction(
				targets.map((target) => {
					const data: Record<string, unknown> = { ...sharedData };
					data.scheduledDate = new Date(target.scheduledDate.getTime() + scheduledDeltaMs);
					return prisma.checkIn.update({ where: { id: target.id }, data });
				})
			);
		}

		const updated = await prisma.checkIn.findFirst({
			where: { id, organisationId: ctx.organisationId },
		});
		return NextResponse.json(updated);
	}

	const data: Record<string, unknown> = { ...sharedData };
	if (parsedScheduledDate != null) data.scheduledDate = parsedScheduledDate;
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
