import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/utils/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const client: any = prisma;

  const existing = await client.checkInRule.findFirst({
    where: { id, organisationId: ctx.organisationId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: any = {};
  if (typeof body.name === "string") data.name = body.name;
  if (typeof body.recurrence === "string") data.recurrence = body.recurrence;
  if (typeof body.notesTemplate === "string" || body.notesTemplate === null) {
    data.notesTemplate = body.notesTemplate;
  }
  if (typeof body.active === "boolean") data.active = body.active;

  const updated = await client.checkInRule.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const client: any = prisma;

  const existing = await client.checkInRule.findFirst({
    where: { id, organisationId: ctx.organisationId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await client.checkInRule.update({
    where: { id },
    data: { active: false },
  });

  return NextResponse.json({ success: true });
}

