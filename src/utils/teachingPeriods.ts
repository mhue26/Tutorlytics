const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

export interface TermLike {
  name: string;
  startDate: Date;
  endDate: Date;
}

export interface TeachingPeriodWithType extends TermLike {
  type: "term" | "holiday";
}

/**
 * Find the term that contains the given date and return the 1-based week number within that term.
 * Returns null if the date does not fall within any term.
 */
export function getTermAndWeekForDate(
  date: Date,
  terms: TermLike[]
): { termName: string; weekNumber: number } | null {
  const t = new Date(date).getTime();
  for (const term of terms) {
    const start = new Date(term.startDate).getTime();
    const end = new Date(term.endDate).getTime();
    if (t >= start && t <= end) {
      const weekIndex = Math.floor((t - start) / MS_PER_WEEK);
      const termWeeks = Math.ceil((end - start) / MS_PER_WEEK) || 1;
      const weekNumber = Math.min(weekIndex + 1, termWeeks);
      return { termName: term.name, weekNumber };
    }
  }
  return null;
}

export interface MeetingLike {
  title: string;
  startTime: Date;
}

/**
 * Return the lesson display title, appending " - {termName} Week {weekNumber}" when the meeting falls within a term.
 */
export function getLessonDisplayTitle(
  meeting: MeetingLike,
  terms: TermLike[]
): string {
  const termWeek = getTermAndWeekForDate(
    typeof meeting.startTime === "string" ? new Date(meeting.startTime) : meeting.startTime,
    terms
  );
  if (!termWeek) return meeting.title;
  return `${meeting.title} - ${termWeek.termName} Week ${termWeek.weekNumber}`;
}
