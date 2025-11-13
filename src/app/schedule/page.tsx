import { authOptions } from "@/utils/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ScheduleClient from "./ScheduleClient";

export default async function SchedulePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/signin");
  }

  // Fetch students for the form
  const students = await prisma.student.findMany({
    where: {
      userId: (session.user as any).id,
      isArchived: false,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
    orderBy: {
      firstName: "asc",
    },
  });

  return (
    <ScheduleClient students={students} userId={(session.user as any).id} />
  );
}
