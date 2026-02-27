import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/utils/auth";

export async function GET(request: NextRequest) {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const studentIdParam = searchParams.get("studentId");

  const where: any = {
    organisationId: ctx.organisationId,
    active: true,
  };

  if (studentIdParam) {
    where.studentId = Number(studentIdParam);
  }

  const client: any = prisma;
  const rules = await client.checkInRule.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(rules);
}

export async function POST(request: NextRequest) {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { studentId, anchor, recurrence, name, notesTemplate } = body;

  if (!studentId || !anchor || !recurrence) {
    return NextResponse.json(
      { error: "studentId, anchor, and recurrence are required" },
      { status: 400 }
    );
  }

  const parsedAnchor = new Date(anchor);
  if (Number.isNaN(parsedAnchor.getTime())) {
    return NextResponse.json({ error: "Invalid anchor date" }, { status: 400 });
  }

  const client: any = prisma;

  const rule = await client.checkInRule.create({
    data: {
      name: name || "Recurring check-in",
      recurrence,
      anchor: parsedAnchor,
      notesTemplate: notesTemplate || null,
      organisationId: ctx.organisationId,
      studentId: Number(studentId),
    },
  });

  // Ensure at least one upcoming check-in instance exists for this rule
  await prisma.checkIn.create({
    data: {
      scheduledDate: parsedAnchor,
      notes: notesTemplate || null,
      organisationId: ctx.organisationId,
      studentId: Number(studentId),
      teacherId: ctx.userId,
      ruleId: rule.id,
    },
  });

  return NextResponse.json(rule, { status: 201 });
}

