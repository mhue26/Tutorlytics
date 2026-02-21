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

	const today = new Date();

	const formatTime = (date: Date) =>
		date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

	const formatDate = (date: Date) =>
		date.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

	const formatMeetingDate = (date: Date) => {
		const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		const tomorrow = new Date(todayDate);
		tomorrow.setDate(tomorrow.getDate() + 1);
		const meetingDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		if (meetingDate.getTime() === todayDate.getTime()) return "Today";
		if (meetingDate.getTime() === tomorrow.getTime()) return "Tomorrow";
		return date.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" });
	};

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
				{recentMeetings.length > 0 ? (
					<div className="space-y-3">
						{recentMeetings.map((meeting) => {
							const meetingDate = new Date(meeting.startTime);
							const isPast = meetingDate < today;
							const isCompleted = meeting.isCompleted;
							return (
								<div key={meeting.id} className="rounded-2xl p-4 hover:shadow-sm transition-shadow">
									<div className="flex justify-between items-start mb-2">
										<div>
											<h3 className="font-medium text-gray-900">{meeting.title}</h3>
											<p className="text-sm text-gray-500">{formatMeetingDate(meetingDate)}</p>
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
