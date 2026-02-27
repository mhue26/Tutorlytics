import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import ClassesClient from "./ClassesClient";

export default async function ClassesPage() {
	const ctx = await requireOrgContext();

	const classes = await prisma.class.findMany({
		where: { organisationId: ctx.organisationId },
		select: {
			id: true,
			name: true,
			description: true,
			color: true,
			createdAt: true,
			subject: true,
			year: true,
			defaultRateCents: true,
			format: true,
			students: {
				select: { id: true, firstName: true, lastName: true, email: true },
			},
		},
		orderBy: { createdAt: "desc" },
	});

	return <ClassesClient classes={classes as any} />;
}
