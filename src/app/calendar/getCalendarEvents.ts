import { prisma } from "@/lib/prisma";

export type CalendarEventType = "LESSON" | "CHECK_IN" | "KEY_DATE";

export interface CalendarEventDTO {
  id: string;
  type: CalendarEventType;
  title: string;
  description?: string | null;
  start: Date;
  end: Date | null;
  allDay: boolean;
  studentId?: number;
  classId?: number;
}

interface CalendarEventsRange {
  from: Date;
  to: Date;
}

interface OrgContext {
  organisationId: string;
  userId: string;
  role: string;
}

export interface CalendarEventsResult {
  events: CalendarEventDTO[];
  meetings: any[];
  checkIns: any[];
  keyDates: any[];
}

export async function getCalendarEvents(
  ctx: OrgContext,
  range: CalendarEventsRange
): Promise<CalendarEventsResult> {
  const { from, to } = range;

  const meetingWhere: any = {
    organisationId: ctx.organisationId,
    startTime: { gte: from, lte: to },
  };
  if (ctx.role === "TEACHER") {
    meetingWhere.createdById = ctx.userId;
  }

  const checkInWhere: any = {
    organisationId: ctx.organisationId,
    scheduledDate: { gte: from, lte: to },
  };
  if (ctx.role === "TEACHER") {
    checkInWhere.teacherId = ctx.userId;
  }

  const client: any = prisma;

  const [meetings, checkIns, keyDates] = await Promise.all([
    prisma.meeting.findMany({
      where: meetingWhere,
      include: { student: true },
      orderBy: { startTime: "asc" },
    }),
    prisma.checkIn.findMany({
      where: checkInWhere,
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { scheduledDate: "asc" },
    }),
    // Use any-cast so this compiles before Prisma client is regenerated
    client.keyDate?.findMany({
      where: {
        organisationId: ctx.organisationId,
        date: { gte: from, lte: to },
      },
      orderBy: { date: "asc" },
    }) ?? [],
  ]);

  const events: CalendarEventDTO[] = [];

  for (const meeting of meetings) {
    events.push({
      id: `meeting-${meeting.id}`,
      type: "LESSON",
      title: meeting.title || "Lesson",
      description: meeting.description ?? null,
      start: new Date(meeting.startTime),
      end: new Date(meeting.endTime),
      allDay: false,
      studentId: meeting.studentId,
      classId: meeting.student?.classId ?? undefined,
    });
  }

  for (const checkIn of checkIns) {
    events.push({
      id: `checkin-${checkIn.id}`,
      type: "CHECK_IN",
      title: checkIn.student
        ? `Check-in: ${checkIn.student.firstName} ${checkIn.student.lastName}`
        : "Check-in",
      description: checkIn.notes ?? null,
      start: new Date(checkIn.scheduledDate),
      end: null,
      allDay: false,
      studentId: checkIn.studentId,
      classId: undefined,
    });
  }

  for (const keyDate of keyDates) {
    events.push({
      id: `keydate-${keyDate.id}`,
      type: "KEY_DATE",
      title: keyDate.title,
      description: keyDate.description ?? null,
      start: new Date(keyDate.date),
      end: null,
      allDay: true,
      studentId: undefined,
      classId: keyDate.classId ?? undefined,
    });
  }

  return {
    events,
    meetings,
    checkIns,
    keyDates,
  };
}

