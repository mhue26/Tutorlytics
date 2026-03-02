import { requireOrgContext } from "@/utils/auth";
import { prisma } from "@/lib/prisma";
import ScheduleClient from "./ScheduleClient";

export default async function SchedulePage() {
	const ctx = await requireOrgContext();

	const [students, classes, terms, members] = await Promise.all([
		prisma.student.findMany({
			where: { organisationId: ctx.organisationId, isArchived: false },
			select: { id: true, firstName: true, lastName: true, year: true, subjects: true },
			orderBy: { firstName: "asc" },
		}),
		prisma.class.findMany({
			where: { organisationId: ctx.organisationId },
			select: { id: true, name: true },
			orderBy: { name: "asc" },
		}),
		prisma.term.findMany({
			where: { organisationId: ctx.organisationId },
			orderBy: [{ year: "desc" }, { startDate: "asc" }],
		}),
		prisma.organisationMember.findMany({
			where: { organisationId: ctx.organisationId },
			include: { user: { select: { id: true, name: true, email: true } } },
			orderBy: { createdAt: "asc" },
		}),
	]);

	return (
		<ScheduleClient
			students={students as any}
			classes={classes as any}
			terms={terms}
			userId={ctx.userId}
			userRole={ctx.role}
			teachers={members as any}
		/>
	);
}
