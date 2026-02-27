"use server";

import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import { redirect } from "next/navigation";

export async function createMeeting(formData: FormData) {
	const ctx = await requireOrgContext();

	const title = formData.get("title") as string;
	const studentId = formData.get("studentId") as string;
	const meetingDate = formData.get("meetingDate") as string;
	const startTime = formData.get("startTime") as string;
	const endTime = formData.get("endTime") as string;
	const description = (formData.get("description") as string) || "";
	const lessonSubjectsRaw = (formData.get("lessonSubjects") as string | null) ?? "";
	const lessonSubjects = lessonSubjectsRaw.trim();
	const combinedDescription =
		lessonSubjects.length > 0
			? `Subjects: ${lessonSubjects}${description ? `\n\n${description}` : ""}`
			: description || null;
	const isCompleted = formData.get("isCompleted") === "on";
	const isRepeating = formData.get("isRepeating") === "on";
	const repeatType = formData.get("repeatType") as string;
	const repeatCount = parseInt(formData.get("repeatCount") as string) || 1;

	if (!title || !studentId || !meetingDate || !startTime || !endTime) {
		throw new Error("All required fields must be filled");
	}

	const student = await prisma.student.findFirst({
		where: { id: parseInt(studentId), organisationId: ctx.organisationId },
	});
	if (!student) throw new Error("Student not found");

	const baseStartTime = new Date(`${meetingDate}T${startTime}`);
	const baseEndTime = new Date(`${meetingDate}T${endTime}`);

	if (isRepeating && repeatType && repeatCount > 1) {
		const meetings = [];
		for (let i = 0; i < repeatCount; i++) {
			const meetingStartTime = new Date(baseStartTime);
			const meetingEndTime = new Date(baseEndTime);
			if (i > 0) {
				switch (repeatType) {
					case "weekly":
						meetingStartTime.setDate(meetingStartTime.getDate() + i * 7);
						meetingEndTime.setDate(meetingEndTime.getDate() + i * 7);
						break;
					case "biweekly":
						meetingStartTime.setDate(meetingStartTime.getDate() + i * 14);
						meetingEndTime.setDate(meetingEndTime.getDate() + i * 14);
						break;
					case "monthly":
						meetingStartTime.setMonth(meetingStartTime.getMonth() + i);
						meetingEndTime.setMonth(meetingEndTime.getMonth() + i);
						break;
				}
			}
			meetings.push({
				title: i === 0 ? title : `${title} (${i + 1}/${repeatCount})`,
				description: combinedDescription,
				startTime: meetingStartTime,
				endTime: meetingEndTime,
				isCompleted: false,
				createdById: ctx.userId,
				organisationId: ctx.organisationId,
				studentId: parseInt(studentId),
			});
		}
		await prisma.meeting.createMany({ data: meetings });
	} else {
		await prisma.meeting.create({
			data: {
				title,
				description: combinedDescription,
				startTime: baseStartTime,
				endTime: baseEndTime,
				isCompleted,
				createdById: ctx.userId,
				organisationId: ctx.organisationId,
				studentId: parseInt(studentId),
			},
		});
	}

	redirect("/calendar");
}
