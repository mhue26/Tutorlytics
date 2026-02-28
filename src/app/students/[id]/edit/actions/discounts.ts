"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";

export async function addStudentDiscount(studentId: number, discountId: string) {
	const ctx = await requireOrgContext();
	if (ctx.role !== "OWNER" && ctx.role !== "ADMIN") return { error: "Forbidden" };

	const student = await prisma.student.findFirst({
		where: { id: studentId, organisationId: ctx.organisationId },
	});
	if (!student) return { error: "Student not found" };

	const discount = await prisma.discount.findFirst({
		where: { id: discountId },
		include: { billingSettings: true },
	});
	if (!discount || discount.billingSettings.organisationId !== ctx.organisationId) {
		return { error: "Discount not found" };
	}

	await prisma.studentDiscount.upsert({
		where: {
			studentId_discountId: { studentId, discountId },
		},
		create: { studentId, discountId },
		update: {},
	});

	revalidatePath(`/students/${studentId}`);
	revalidatePath(`/students/${studentId}/edit`);
	return {};
}

export async function removeStudentDiscount(studentId: number, discountId: string) {
	const ctx = await requireOrgContext();
	if (ctx.role !== "OWNER" && ctx.role !== "ADMIN") return { error: "Forbidden" };

	const student = await prisma.student.findFirst({
		where: { id: studentId, organisationId: ctx.organisationId },
	});
	if (!student) return { error: "Student not found" };

	await prisma.studentDiscount.deleteMany({
		where: { studentId, discountId },
	});

	revalidatePath(`/students/${studentId}`);
	revalidatePath(`/students/${studentId}/edit`);
	return {};
}
