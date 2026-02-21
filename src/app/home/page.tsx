import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";

export default async function HomePage() {
	const session = await getServerSession(authOptions);
	const ctx = await requireOrgContext();

	const terms = await prisma.term.findMany({
		where: { organisationId: ctx.organisationId },
		orderBy: [{ year: "desc" }, { startDate: "asc" }],
	});

	const today = new Date();
	const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

	const formatDate = (date: Date) =>
		date.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

	let currentTerm: { name: string; startDate: Date; endDate: Date } | null = null;
	let currentWeek: number | null = null;

	for (const term of terms) {
		if (!term.isActive) continue;
		const start = new Date(term.startDate).getTime();
		const end = new Date(term.endDate).getTime();
		if (todayStart >= start && todayStart <= end) {
			currentTerm = { name: term.name, startDate: term.startDate, endDate: term.endDate };
			const diffMs = todayStart - start;
			const diffWeeks = Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000));
			currentWeek = Math.max(1, diffWeeks);
			break;
		}
	}

	const displayName = session?.user?.name ?? "there";

	return (
		<div className="space-y-6 pt-8 font-sans" style={{ fontFamily: "'Work Sans', sans-serif" }}>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-3xl font-semibold" style={{ color: "#3D4756" }}>
						Welcome{displayName !== "there" ? `, ${displayName}` : ""}!
					</h1>
				</div>
				<div className="flex flex-wrap items-center gap-3">
					<div className="flex items-center rounded-full px-4 py-2 shadow-sm" style={{ backgroundColor: "#FEF5eF" }}>
						<svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "#584b53" }}>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<p className="text-base" style={{ color: "#584b53" }}>Today is {formatDate(today)}</p>
					</div>
					{currentTerm && currentWeek !== null && (
						<div className="flex items-center rounded-full px-4 py-2 shadow-sm bg-blue-50">
							<svg className="w-6 h-6 mr-3 flex-shrink-0 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
							<p className="text-base text-blue-800">This is week {currentWeek} of {currentTerm.name}</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
