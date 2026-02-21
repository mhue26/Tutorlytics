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
	const body = await request.json();
	const { status, dueDate, notes } = body;

	const existing = await prisma.invoice.findFirst({
		where: { id, organisationId: ctx.organisationId },
	});
	if (!existing) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

	const data: any = {};
	if (status) data.status = status;
	if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
	if (notes !== undefined) data.notes = notes;

	const invoice = await prisma.invoice.update({ where: { id }, data });
	return NextResponse.json(invoice);
}
