import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import { notFound } from "next/navigation";
import CheckinEditClient from "./CheckinEditClient";

export default async function CheckinEditPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const ctx = await requireOrgContext();
	const where: { id: string; organisationId: string; teacherId?: string } = {
		id,
		organisationId: ctx.organisationId,
	};
	if (ctx.role === "TEACHER") where.teacherId = ctx.userId;

	const checkIn = await prisma.checkIn.findFirst({
		where,
		include: {
			student: { select: { id: true, firstName: true, lastName: true } },
		},
	});
	if (!checkIn) notFound();

	const d = new Date(checkIn.scheduledDate);
	const scheduledDate = d.toISOString().slice(0, 10);
	const scheduledTime = `${`${d.getHours()}`.padStart(2, "0")}:${`${d.getMinutes()}`.padStart(2, "0")}`;

	const initial = {
		id: checkIn.id,
		scheduledDate,
		scheduledTime,
		status: checkIn.status,
		notes: checkIn.notes ?? "",
		ruleId: checkIn.ruleId,
		studentName: checkIn.student
			? `${checkIn.student.firstName} ${checkIn.student.lastName}`
			: "—",
	};

	return <CheckinEditClient checkInId={checkIn.id} initial={initial} />;
}
