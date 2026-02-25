import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";

export default async function DashboardPage() {
	const session = await getServerSession(authOptions);
	const ctx = await requireOrgContext();

	const meetingWhere: any = { organisationId: ctx.organisationId };
	if (ctx.role === "TEACHER") {
		meetingWhere.createdById = ctx.userId;
	}

	const recentMeetings = await prisma.meeting.findMany({
		where: meetingWhere,
		include: { student: true },
		orderBy: { startTime: "desc" },
		take: 5,
	});

	const classSessionWhere: any = { organisationId: ctx.organisationId };
	if (ctx.role === "TEACHER") {
		classSessionWhere.OR = [
			{ createdById: ctx.userId },
			{ class: { teacherId: ctx.userId } },
		];
	}

	const recentClassSessions = await prisma.classSession.findMany({
		where: classSessionWhere,
		include: {
			class: {
				select: {
					id: true,
					name: true,
					color: true,
					students: { select: { id: true } },
				},
			},
		},
		orderBy: { startTime: "desc" },
		take: 5,
	});

	const today = new Date();

	const formatTime = (date: Date) =>
		date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

	const formatDate = (date: Date) =>
		date.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

	const formatEventDate = (date: Date) => {
		const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		const tomorrow = new Date(todayDate);
		tomorrow.setDate(tomorrow.getDate() + 1);
		const meetingDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		if (meetingDate.getTime() === todayDate.getTime()) return "Today";
		if (meetingDate.getTime() === tomorrow.getTime()) return "Tomorrow";
		return date.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" });
	};

	const combinedEvents = [
		...recentMeetings.map((meeting) => ({
			type: "meeting" as const,
			startTime: meeting.startTime,
			data: meeting,
		})),
		...recentClassSessions.map((session) => ({
			type: "classSession" as const,
			startTime: session.startTime,
			data: session,
		})),
	].sort(
		(a, b) =>
			new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
	).slice(0, 5);

	return (
		<div className="space-y-6 pt-8 font-sans" style={{ fontFamily: "'Work Sans', sans-serif" }}>
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-semibold" style={{ color: "#3D4756" }}>
						Welcome{session?.user?.name ? `, ${session.user.name}` : ""}!
					</h1>
				</div>
				<div className="flex items-center rounded-full px-4 py-2 shadow-sm" style={{ backgroundColor: "#FEF5eF" }}>
					<svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#584b53" }}>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<p className="text-base" style={{ color: "#584b53" }}>Today is {formatDate(today)}</p>
				</div>
			</div>

			<div className="bg-white rounded-2xl shadow-sm p-6">
				<h2 className="text-lg font-medium mb-4">Recent Events</h2>
				{combinedEvents.length > 0 ? (
					<div className="space-y-3">
						{combinedEvents.map((event) => {
							const start = new Date(event.startTime);
							const isPast = start < today;

							if (event.type === "meeting") {
								const meeting = event.data;
								const isCompleted = meeting.isCompleted;
								return (
									<div key={`meeting-${meeting.id}`} className="rounded-2xl p-4 hover:shadow-sm transition-shadow">
										<div className="flex justify-between items-start mb-2">
											<div>
												<h3 className="font-medium text-gray-900">{meeting.title}</h3>
												<p className="text-sm text-gray-500">{formatEventDate(start)}</p>
											</div>
											<span className={`px-2 py-1 rounded-full text-xs font-medium ${isPast ? "bg-gray-100 text-gray-800" : isCompleted ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
												{isPast ? "Past" : isCompleted ? "Completed" : "Upcoming"}
											</span>
										</div>
										<div className="text-sm text-gray-600 mb-2">
											<div className="flex items-center gap-2">
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												{formatTime(new Date(meeting.startTime))} - {formatTime(new Date(meeting.endTime))}
											</div>
										</div>
										<div className="text-sm text-gray-600">
											<div className="flex items-center gap-2">
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
												</svg>
												{meeting.student.firstName} {meeting.student.lastName}
											</div>
										</div>
										{meeting.description && (
											<p className="text-sm text-gray-600 mt-2">{meeting.description}</p>
										)}
									</div>
								);
							}

							const session = event.data;
							const classObj = session.class;
							const label = `${classObj.name}`;
							const studentCount = classObj.students.length;

							return (
								<div key={`classSession-${session.id}`} className="rounded-2xl p-4 hover:shadow-sm transition-shadow">
									<div className="flex justify-between items-start mb-2">
										<div>
											<div className="flex items-center gap-2">
												<div
													className="w-3 h-3 rounded-full"
													style={{ backgroundColor: classObj.color }}
												/>
												<h3 className="font-medium text-gray-900">
													{session.title || label}
												</h3>
											</div>
											<p className="text-xs inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 mt-1">
												Class
											</p>
											<p className="text-sm text-gray-500 mt-1">
												{formatEventDate(start)} • {studentCount} student
												{studentCount === 1 ? "" : "s"}
											</p>
										</div>
										<span className={`px-2 py-1 rounded-full text-xs font-medium ${isPast ? "bg-gray-100 text-gray-800" : "bg-yellow-100 text-yellow-800"}`}>
											{isPast ? "Past" : "Upcoming"}
										</span>
									</div>
									<div className="text-sm text-gray-600 mb-3">
										<div className="flex items-center gap-2">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											{formatTime(new Date(session.startTime))} - {formatTime(new Date(session.endTime))}
										</div>
									</div>
									<div className="flex justify-between items-center">
										<div className="text-xs text-gray-500">
											<Link
												href={`/classes/${classObj.id}`}
												className="hover:underline text-gray-600"
											>
												View class
											</Link>
										</div>
										<Link
											href={`/classes/sessions/${session.id}/attendance`}
											className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-[#3D4756] text-white hover:bg-[#2A3441] transition-colors"
										>
											Take attendance
										</Link>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="text-center py-8">
						<svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
						<h3 className="text-lg font-medium mb-4" style={{ color: "#A1ACBD" }}>No upcoming events</h3>
						<a href="/schedule" className="inline-flex items-center px-6 py-3 bg-[#3D4756] text-white rounded-2xl font-semibold text-base hover:bg-[#2A3441] transition-colors duration-200">
							Schedule
						</a>
					</div>
				)}
			</div>
		</div>
	);
}
