import { requireOrgContext } from "@/utils/auth";
import { prisma } from "@/lib/prisma";
import ScheduleClient from "./ScheduleClient";

export default async function SchedulePage() {
	const ctx = await requireOrgContext();

	const students = await prisma.student.findMany({
		where: { organisationId: ctx.organisationId, isArchived: false },
		select: { id: true, firstName: true, lastName: true },
		orderBy: { firstName: "asc" },
	});

	return <ScheduleClient students={students as any} userId={ctx.userId} />;
}
