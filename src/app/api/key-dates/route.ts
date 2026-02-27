import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/utils/auth";

export async function GET(request: NextRequest) {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const where: any = {
    organisationId: ctx.organisationId,
  };

  if (fromParam || toParam) {
    where.date = {};
    if (fromParam) {
      where.date.gte = new Date(fromParam);
    }
    if (toParam) {
      where.date.lte = new Date(toParam);
    }
  }

  const client: any = prisma;
  const keyDates = await client.keyDate.findMany({
    where,
    orderBy: { date: "asc" },
  });

  return NextResponse.json(keyDates);
}

export async function POST(request: NextRequest) {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, date, description, scope, classId, year, color } = body;

  if (!title || !date) {
    return NextResponse.json({ error: "Title and date are required" }, { status: 400 });
  }

  // Normalise to midnight local time for date-only semantics
  const parsed = new Date(date);
  const normalizedDate = new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate()
  );

  const client: any = prisma;
  const keyDate = await client.keyDate.create({
    data: {
      title,
      date: normalizedDate,
      allDay: true,
      description: description || null,
      color: color || null,
      scope: scope || "ORGANISATION",
      year: typeof year === "number" ? year : year ? Number(year) || null : null,
      organisationId: ctx.organisationId,
      classId: classId ? Number(classId) : null,
    },
  });

  return NextResponse.json(keyDate, { status: 201 });
}

