import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

async function createClass(formData: FormData) {
	"use server";
	const ctx = await requireOrgContext();

	const name = String(formData.get("name") || "").trim();
	const description = String(formData.get("description") || "").trim() || null;
	const color = String(formData.get("color") || "#3B82F6").trim();
	const teacherId = String(formData.get("teacherId") || "").trim() || null;

	await prisma.class.create({
		data: {
			name,
			description,
			color,
			organisationId: ctx.organisationId,
			teacherId,
		},
	});

	redirect("/classes");
}

export default async function NewClassPage() {
	const ctx = await requireOrgContext();

	const members = await prisma.organisationMember.findMany({
		where: { organisationId: ctx.organisationId },
		include: { user: { select: { id: true, name: true, email: true } } },
		orderBy: { createdAt: "asc" },
	});

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Link href="/classes" className="text-gray-600 hover:text-gray-800">← Back to Classes</Link>
				<h1 className="text-2xl font-semibold">Create New Class</h1>
			</div>

			<div className="bg-white rounded-2xl shadow-sm p-6">
				<form action={createClass} className="space-y-6">
					<div>
						<label className="block text-sm text-gray-700 mb-2">Class Name</label>
						<input name="name" type="text" required className="w-full border-0 bg-gray-50 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#3D4756]/20 focus:bg-white" placeholder="Enter class name" />
					</div>

					<div>
						<label className="block text-sm text-gray-700 mb-2">Description (Optional)</label>
						<textarea name="description" rows={3} className="w-full border-0 bg-gray-50 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#3D4756]/20 focus:bg-white resize-none" placeholder="Enter class description" />
					</div>

					<div>
						<label className="block text-sm text-gray-700 mb-2">Assigned Teacher</label>
						<select name="teacherId" className="w-full border-0 bg-gray-50 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#3D4756]/20 focus:bg-white">
							<option value="">No teacher assigned</option>
							{members.map((m) => (
								<option key={m.user.id} value={m.user.id}>
									{m.user.name || m.user.email} ({m.role})
								</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-sm text-gray-700 mb-2">Color</label>
						<div className="flex gap-2">
							{[
								{ name: "Blue", value: "#3B82F6" },
								{ name: "Green", value: "#10B981" },
								{ name: "Purple", value: "#8B5CF6" },
								{ name: "Pink", value: "#EC4899" },
								{ name: "Orange", value: "#F59E0B" },
								{ name: "Red", value: "#EF4444" },
							].map((color) => (
								<label key={color.value} className="flex items-center gap-2 cursor-pointer">
									<input type="radio" name="color" value={color.value} defaultChecked={color.value === "#3B82F6"} className="sr-only peer" />
									<div className="w-8 h-8 rounded-full ring-2 ring-transparent ring-offset-2 hover:ring-gray-300 transition-all peer-checked:ring-[#3D4756]" style={{ backgroundColor: color.value }}></div>
								</label>
							))}
						</div>
					</div>

					<div className="flex gap-4">
						<button type="submit" className="bg-[#3D4756] text-white px-4 py-2 rounded-md hover:bg-[#2A3441] transition-colors">Create Class</button>
						<Link href="/classes" className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors">Cancel</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
