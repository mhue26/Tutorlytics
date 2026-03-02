import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		await prisma.$queryRaw`SELECT 1 as test`;
		const userCount = await prisma.user.count();
		const orgCount = await prisma.organisation.count();
		return NextResponse.json({
			success: true,
			message: "Database connection successful",
			userCount,
			orgCount,
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error instanceof Error ? error.message : "Unknown error" },
			{ status: 500 }
		);
	}
}
