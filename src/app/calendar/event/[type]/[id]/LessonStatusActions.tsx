"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type LessonStatus = "SCHEDULED" | "IN_PROGRESS" | "CANCELLED" | "NEEDS_REVIEW" | "COMPLETED";

interface LessonStatusActionsProps {
	meetingId: number;
	status: LessonStatus;
}

export default function LessonStatusActions({ meetingId, status }: LessonStatusActionsProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const patchStatus = async (nextStatus: LessonStatus, cancelReason?: string) => {
		setLoading(true);
		try {
			const res = await fetch(`/api/meetings/${meetingId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					status: nextStatus,
					cancelReason: cancelReason?.trim() ? cancelReason.trim() : null,
					scope: "this",
				}),
			});
			if (!res.ok) throw new Error("Failed to update lesson");
			router.refresh();
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex items-center gap-3 pt-4">
			{status === "SCHEDULED" && (
				<>
					<button
						type="button"
						disabled={loading}
						onClick={() => patchStatus("IN_PROGRESS")}
						className="px-5 py-2 bg-[#3D4756] text-white rounded-lg shadow-sm hover:bg-[#2A3441] font-medium text-sm transition-colors disabled:opacity-50"
					>
						Start lesson
					</button>
					<button
						type="button"
						disabled={loading}
						onClick={() => {
							const reason = window.prompt("Reason for cancellation (optional):", "");
							patchStatus("CANCELLED", reason ?? undefined);
						}}
						className="px-5 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium text-sm transition-colors disabled:opacity-50"
					>
						Cancel lesson
					</button>
				</>
			)}

			{(status === "IN_PROGRESS" || status === "NEEDS_REVIEW") && (
				<Link
					href={`/calendar/event/lesson/${meetingId}/edit`}
					className="px-5 py-2 bg-[#3D4756] text-white rounded-lg shadow-sm hover:bg-[#2A3441] font-medium text-sm transition-colors"
				>
					Review lesson
				</Link>
			)}

			{status !== "IN_PROGRESS" && status !== "NEEDS_REVIEW" && (
				<Link
					href={`/calendar/event/lesson/${meetingId}/edit`}
					className="px-5 py-2 bg-[#3D4756] text-white rounded-lg shadow-sm hover:bg-[#2A3441] font-medium text-sm transition-colors"
				>
					Edit
				</Link>
			)}

			<Link
				href="/calendar"
				className="px-5 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium text-sm transition-colors"
			>
				Back to calendar
			</Link>
		</div>
	);
}
