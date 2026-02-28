import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import { notFound } from "next/navigation";
import KeydateEditClient from "./KeydateEditClient";

function toDateString(d: Date): string {
	const x = new Date(d);
	return `${x.getFullYear()}-${`${x.getMonth() + 1}`.padStart(2, "0")}-${`${x.getDate()}`.padStart(2, "0")}`;
}

export default async function KeydateEditPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const ctx = await requireOrgContext();

	const [keyDate, classes] = await Promise.all([
		prisma.keyDate.findFirst({
			where: { id, organisationId: ctx.organisationId },
			include: { class: true },
		}),
		prisma.class.findMany({
			where: { organisationId: ctx.organisationId },
			orderBy: { name: "asc" },
			select: { id: true, name: true },
		}),
	]);

	if (!keyDate) notFound();

	const initial = {
		id: keyDate.id,
		title: keyDate.title,
		date: toDateString(keyDate.date),
		description: keyDate.description ?? "",
		scope: keyDate.scope,
		classId: keyDate.classId != null ? String(keyDate.classId) : "",
		year: keyDate.year != null ? String(keyDate.year) : "",
		color: keyDate.color ?? "",
	};

	return <KeydateEditClient keyDateId={keyDate.id} initial={initial} classes={classes} />;
}
