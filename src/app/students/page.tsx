import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import StudentsClient from "./StudentsClient";

async function ensureYearLevelPromotion(organisationId: string) {
	const currentYear = new Date().getFullYear();

	// Ensure preferences row exists
	const prefs = await prisma.organisationPreferences.upsert({
		where: { organisationId },
		update: {},
		create: { organisationId },
	});

	if (prefs.studentYearLastPromoted && prefs.studentYearLastPromoted >= currentYear) {
		return;
	}

	await prisma.$transaction(async (tx) => {
		// Increment all years < 12 by 1
		await tx.student.updateMany({
			where: {
				organisationId,
				year: { not: null, lt: 12 },
			},
			data: {
				year: { increment: 1 },
			},
		});

		// Move Year 12 (and above) to the "graduated" bucket (13)
		await tx.student.updateMany({
			where: {
				organisationId,
				year: 12,
			},
			data: {
				year: 13,
			},
		});

		await tx.organisationPreferences.update({
			where: { organisationId },
			data: { studentYearLastPromoted: currentYear },
		});
	});
}

export default async function StudentsPage() {
	const ctx = await requireOrgContext();

	await ensureYearLevelPromotion(ctx.organisationId);

	const students = await prisma.student.findMany({
		where: {
			organisationId: ctx.organisationId,
			isArchived: false,
		},
		orderBy: { createdAt: "desc" },
	});

	const archivedStudents = await prisma.student.findMany({
		where: {
			organisationId: ctx.organisationId,
			isArchived: true,
		},
		orderBy: { updatedAt: "desc" },
	});

	return <StudentsClient students={students as any} archivedStudents={archivedStudents as any} />;
}
