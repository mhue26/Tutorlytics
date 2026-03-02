"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { popCalendarUndo, hasCalendarUndo } from "./calendarUndo";

/**
 * Listens for Cmd+Z / Ctrl+Z and runs the last calendar undo (create or update meeting).
 * Mounted in the dashboard layout so undo works from calendar, event detail, or schedule.
 */
export default function CalendarUndoListener() {
	const router = useRouter();

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
				const active = document.activeElement;
				if (
					active &&
					(active instanceof HTMLInputElement ||
						active instanceof HTMLTextAreaElement ||
						(active as HTMLElement).isContentEditable)
				)
					return;
				if (!hasCalendarUndo()) return;
				e.preventDefault();
				const entry = popCalendarUndo();
				if (!entry) return;
				if (entry.type === "create_meeting") {
					Promise.all(
						entry.payload.meetingIds.map((id) =>
							fetch(`/api/meetings/${id}`, { method: "DELETE" })
						)
					).then(() => {
						router.push("/calendar");
						router.refresh();
					});
				} else if (entry.type === "update_meeting") {
					const { meetingId, previousState } = entry.payload;
					fetch(`/api/meetings/${meetingId}`, {
						method: "PATCH",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(previousState),
					}).then(() => {
						router.push("/calendar");
						router.refresh();
					});
				}
			}
		};
		window.addEventListener("keydown", handleKeyDown, true);
		return () => window.removeEventListener("keydown", handleKeyDown, true);
	}, [router]);

	return null;
}
