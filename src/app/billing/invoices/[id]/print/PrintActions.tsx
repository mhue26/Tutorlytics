"use client";

import Link from "next/link";

export default function PrintActions({ invoiceId }: { invoiceId: string }) {
	return (
		<div className="mb-8 flex items-center justify-between print:hidden">
			<Link
				href={`/billing/invoices/${invoiceId}`}
				className="text-sm text-gray-500 hover:text-gray-700"
			>
				← Back to invoice
			</Link>
			<button
				type="button"
				onClick={() => window.print()}
				className="rounded-lg bg-[#3D4756] px-4 py-2 text-sm font-medium text-white hover:bg-[#2A3441]"
			>
				Print / Save as PDF
			</button>
		</div>
	);
}
