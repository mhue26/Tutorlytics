/**
 * Calendar undo stack (sessionStorage). Used so that after redirect we can still undo.
 * Cmd+Z / Ctrl+Z on the calendar page pops and executes the last action.
 */

const STORAGE_KEY = "calendarUndoStack";
const MAX_ENTRIES = 10;

export type CalendarUndoEntry =
	| { type: "create_meeting"; payload: { meetingIds: number[] } }
	| { type: "update_meeting"; payload: { meetingId: number; previousState: Record<string, unknown> } };

function getStack(): CalendarUndoEntry[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as CalendarUndoEntry[];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function setStack(stack: CalendarUndoEntry[]) {
	if (typeof window === "undefined") return;
	try {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stack.slice(-MAX_ENTRIES)));
	} catch {
		// ignore
	}
}

export function pushCalendarUndo(entry: CalendarUndoEntry) {
	const stack = getStack();
	stack.push(entry);
	setStack(stack);
}

export function popCalendarUndo(): CalendarUndoEntry | null {
	const stack = getStack();
	const entry = stack.pop() ?? null;
	setStack(stack);
	return entry;
}

export function hasCalendarUndo(): boolean {
	return getStack().length > 0;
}
