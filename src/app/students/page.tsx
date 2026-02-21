import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import StudentsClient from "./StudentsClient";

export default async function StudentsPage() {
	const ctx = await requireOrgContext();

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
