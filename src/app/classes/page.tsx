import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import ClassesClient from "./ClassesClient";

export default async function ClassesPage() {
	const ctx = await requireOrgContext();

	const classes = await prisma.class.findMany({
		where: { organisationId: ctx.organisationId },
		include: {
			students: {
				select: { id: true, firstName: true, lastName: true, email: true },
			},
		},
		orderBy: { createdAt: "desc" },
	});

	return (
		<div className="space-y-6 pt-8">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold text-[#3D4756]">Classes</h1>
			</div>
			<ClassesClient classes={classes as any} />
		</div>
	);
}
