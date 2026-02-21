import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
	const email = "tutor@example.com";
	const passwordHash = await bcrypt.hash("password123", 10);
	const tutor = await prisma.user.upsert({
		where: { email },
		update: {},
		create: { email, name: "Default Tutor", passwordHash },
	});

	let org = await prisma.organisation.findFirst({
		where: { members: { some: { userId: tutor.id } } },
	});
	if (!org) {
		org = await prisma.organisation.create({
			data: { name: "Demo Tutoring Centre", slug: "demo-tutoring" },
		});
		await prisma.organisationMember.create({
			data: { userId: tutor.id, organisationId: org.id, role: "OWNER" },
		});
	}

	const count = await prisma.student.count();
	if (count === 0) {
		await prisma.student.createMany({
			data: [
				{
					firstName: "Alice",
					lastName: "Nguyen",
					email: "alice@example.com",
					phone: "555-123-4567",
					subjects: "Math, Physics",
					hourlyRateCents: 5000,
					notes: "Preparing for SAT.",
					organisationId: org.id,
				},
				{
					firstName: "Ben",
					lastName: "Santos",
					email: "ben@example.com",
					subjects: "English, History",
					hourlyRateCents: 4500,
					notes: "Struggles with essay structure.",
					organisationId: org.id,
				},
				{
					firstName: "Chloe",
					lastName: "Park",
					email: "chloe@example.com",
					subjects: "Chemistry",
					hourlyRateCents: 6000,
					notes: null,
					organisationId: org.id,
				},
			],
		});
		console.log("Seeded tutor, org, and students.");
	}

	const students = await prisma.student.findMany({
		where: { organisationId: org.id },
	});
	if (students.length > 0) {
		const meetingCount = await prisma.meeting.count();
		if (meetingCount === 0) {
			const now = new Date();
			const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
			const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
			await prisma.meeting.createMany({
				data: [
					{
						title: "Math Tutoring Session",
						description: "Working on algebra problems",
						startTime: new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000),
						endTime: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000),
						isCompleted: false,
						createdById: tutor.id,
						organisationId: org.id,
						studentId: students[0].id,
					},
					{
						title: "Physics Review",
						description: "Preparing for upcoming test",
						startTime: new Date(nextWeek.getTime() + 10 * 60 * 60 * 1000),
						endTime: new Date(nextWeek.getTime() + 11 * 60 * 60 * 1000),
						isCompleted: false,
						createdById: tutor.id,
						organisationId: org.id,
						studentId: students[0].id,
					},
					{
						title: "English Essay Help",
						description: "Working on argumentative essay structure",
						startTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
						endTime: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
						isCompleted: false,
						createdById: tutor.id,
						organisationId: org.id,
						studentId: students[1]?.id || students[0].id,
					},
				],
				skipDuplicates: true,
			});
			console.log("Added sample meetings.");
		}
	}
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
