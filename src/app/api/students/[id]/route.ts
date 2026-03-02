import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/utils/auth";

type EditableField = "firstName" | "lastName" | "subjects" | "year" | "hourlyRate";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getOrgContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const studentId = Number.parseInt(id, 10);
  if (Number.isNaN(studentId)) {
    return NextResponse.json({ error: "Invalid student ID" }, { status: 400 });
  }

  const existing = await prisma.student.findFirst({
    where: { id: studentId, organisationId: ctx.organisationId },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const body = await request.json();
  const field = String(body?.field || "") as EditableField;
  const value = body?.value;

  const data: {
    firstName?: string;
    lastName?: string;
    subjects?: string;
    year?: number | null;
    hourlyRateCents?: number;
  } = {};

  if (field === "firstName") {
    const v = String(value || "").trim();
    if (!v) return NextResponse.json({ error: "First name is required" }, { status: 400 });
    data.firstName = v;
  } else if (field === "lastName") {
    const v = String(value || "").trim();
    if (!v) return NextResponse.json({ error: "Last name is required" }, { status: 400 });
    data.lastName = v;
  } else if (field === "subjects") {
    const v = String(value || "").trim();
    data.subjects = v || "";
  } else if (field === "year") {
    const raw = String(value || "").trim();
    if (!raw) {
      data.year = null;
    } else {
      const year = Number.parseInt(raw, 10);
      if (Number.isNaN(year) || year < 0) {
        return NextResponse.json({ error: "Year must be a positive number" }, { status: 400 });
      }
      data.year = year;
    }
  } else if (field === "hourlyRate") {
    const raw = String(value || "").trim();
    const amount = Number.parseFloat(raw);
    if (Number.isNaN(amount) || amount < 0) {
      return NextResponse.json({ error: "Rate must be a valid positive number" }, { status: 400 });
    }
    data.hourlyRateCents = Math.round(amount * 100);
  } else {
    return NextResponse.json({ error: "Unsupported field" }, { status: 400 });
  }

  const student = await prisma.student.update({
    where: { id: studentId },
    data,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      subjects: true,
      year: true,
      hourlyRateCents: true,
    },
  });

  return NextResponse.json({ student });
}
