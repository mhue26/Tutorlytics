import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/utils/auth";

type EditableField = "name" | "subject" | "year" | "defaultRate" | "format";

const FORMAT_VALUES = ["IN_PERSON", "ONLINE", "HYBRID"] as const;

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const classId = Number.parseInt(id, 10);
  if (Number.isNaN(classId)) {
    return NextResponse.json({ error: "Invalid class ID" }, { status: 400 });
  }

  const existing = await prisma.class.findFirst({
    where: { id: classId, organisationId: ctx.organisationId },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const body = await request.json();
  const field = String(body?.field || "") as EditableField;
  const value = body?.value;

  const data: {
    name?: string;
    subject?: string | null;
    year?: number | null;
    defaultRateCents?: number | null;
    format?: "IN_PERSON" | "ONLINE" | "HYBRID";
  } = {};

  if (field === "name") {
    const v = String(value || "").trim();
    if (!v) return NextResponse.json({ error: "Class name is required" }, { status: 400 });
    data.name = v;
  } else if (field === "subject") {
    const v = String(value || "").trim();
    data.subject = v || null;
  } else if (field === "year") {
    const raw = String(value || "").trim();
    if (!raw) {
      data.year = null;
    } else {
      const year = Number.parseInt(raw, 10);
      if (Number.isNaN(year) || year < 1 || year > 12) {
        return NextResponse.json({ error: "Year must be 1–12" }, { status: 400 });
      }
      data.year = year;
    }
  } else if (field === "defaultRate") {
    const raw = String(value || "").trim();
    if (!raw) {
      data.defaultRateCents = null;
    } else {
      const amount = Number.parseFloat(raw);
      if (Number.isNaN(amount) || amount < 0) {
        return NextResponse.json({ error: "Rate must be a valid positive number" }, { status: 400 });
      }
      data.defaultRateCents = Math.round(amount * 100);
    }
  } else if (field === "format") {
    const v = String(value || "").toUpperCase();
    if (!FORMAT_VALUES.includes(v as (typeof FORMAT_VALUES)[number])) {
      return NextResponse.json({ error: "Format must be IN_PERSON, ONLINE, or HYBRID" }, { status: 400 });
    }
    data.format = v as "IN_PERSON" | "ONLINE" | "HYBRID";
  } else {
    return NextResponse.json({ error: "Unsupported field" }, { status: 400 });
  }

  const updated = await prisma.class.update({
    where: { id: classId },
    data,
    select: {
      id: true,
      name: true,
      subject: true,
      year: true,
      defaultRateCents: true,
      format: true,
    },
  });

  return NextResponse.json({ class: updated });
}
