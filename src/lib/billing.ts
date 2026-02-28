import { prisma } from "@/lib/prisma";

/**
 * Updates invoice status to OVERDUE for any invoice that is SENT or PARTIALLY_PAID
 * and has dueDate before the start of today (organisation-scoped).
 */
export async function markOverdueInvoices(organisationId: string): Promise<number> {
	const startOfToday = new Date();
	startOfToday.setHours(0, 0, 0, 0);

	const result = await prisma.invoice.updateMany({
		where: {
			organisationId,
			status: { in: ["SENT", "PARTIALLY_PAID"] },
			dueDate: { lt: startOfToday },
		},
		data: { status: "OVERDUE" },
	});

	return result.count;
}
