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

  const existing = await client.keyDate.findFirst({
    where: { id, organisationId: ctx.organisationId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updateData: any = {};

  if (typeof body.title === "string") updateData.title = body.title;
  if (typeof body.description === "string" || body.description === null) {
    updateData.description = body.description;
  }
  if (body.date) {
    const parsed = new Date(body.date);
    updateData.date = new Date(
      parsed.getFullYear(),
      parsed.getMonth(),
      parsed.getDate()
    );
  }
  if (typeof body.color === "string" || body.color === null) {
    updateData.color = body.color;
  }
  if (typeof body.scope === "string") {
    updateData.scope = body.scope;
  }
  if (body.classId !== undefined) {
    updateData.classId = body.classId ? Number(body.classId) : null;
  }
  if (body.year !== undefined) {
    updateData.year =
      typeof body.year === "number" ? body.year : Number(body.year) || null;
  }

  const updated = await client.keyDate.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const client: any = prisma;

  const existing = await client.keyDate.findFirst({
    where: { id, organisationId: ctx.organisationId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await client.keyDate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

