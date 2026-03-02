"use client";

import { useTransition } from "react";
import { addStudentDiscount, removeStudentDiscount } from "./actions/discounts";

type Discount = {
	id: string;
	name: string;
	type: "PERCENTAGE" | "FIXED";
	value: number;
};

interface StudentDiscountsClientProps {
	studentId: number;
	orgDiscounts: Discount[];
	assignedDiscountIds: string[];
	canEdit: boolean;
}

export default function StudentDiscountsClient({
	studentId,
	orgDiscounts,
	assignedDiscountIds,
	canEdit,
}: StudentDiscountsClientProps) {
	const [isPending, startTransition] = useTransition();

	const assignedSet = new Set(assignedDiscountIds);

	const toggle = (discountId: string, currentlyAssigned: boolean) => {
		if (!canEdit) return;
		startTransition(async () => {
			if (currentlyAssigned) {
				await removeStudentDiscount(studentId, discountId);
			} else {
				await addStudentDiscount(studentId, discountId);
			}
		});
	};

	if (orgDiscounts.length === 0) {
		return (
			<p className="text-sm text-gray-500">
				No discounts set up yet. Add discounts in Settings → Billing &amp; Pricing, then assign them to students here.
			</p>
		);
	}

	return (
		<div className="space-y-2">
			<p className="text-sm text-gray-600">
				Assign discounts to this student. They will be applied when generating term invoices.
			</p>
			<ul className="space-y-2">
				{orgDiscounts.map((d) => {
					const assigned = assignedSet.has(d.id);
					const label =
						d.type === "PERCENTAGE"
							? `${d.name} (${d.value}%)`
							: `${d.name} ($${(Number(d.value) / 100).toFixed(2)})`;
					return (
						<li key={d.id} className="flex items-center gap-3">
							<label className="flex items-center gap-2 cursor-pointer">
								<input
									type="checkbox"
									checked={assigned}
									disabled={!canEdit || isPending}
									onChange={() => toggle(d.id, assigned)}
									className="h-4 w-4 rounded border-gray-300 text-[#3D4756] focus:ring-[#3D4756]"
								/>
								<span className="text-sm text-gray-900">{label}</span>
							</label>
						</li>
					);
				})}
			</ul>
			{isPending && <p className="text-xs text-gray-500">Saving…</p>}
		</div>
	);
}
