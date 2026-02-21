import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/utils/auth";

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const ctx = await getOrgContext();
	if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await params;
	const existing = await prisma.assessment.findFirst({
		where: { id, organisationId: ctx.organisationId },
	});
	if (!existing) {
		return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
	}

	await prisma.assessment.delete({ where: { id } });
	return NextResponse.json({ success: true });
}
