import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import Link from "next/link";

async function updateOrg(formData: FormData) {
	"use server";
	const ctx = await requireOrgContext();
	if (ctx.role !== "OWNER") return;

	const name = String(formData.get("name") || "").trim();
	if (!name) return;

	await prisma.organisation.update({
		where: { id: ctx.organisationId },
		data: { name },
	});

	redirect("/settings");
}

export default async function SettingsPage() {
	const ctx = await requireOrgContext();

	const org = await prisma.organisation.findUnique({
		where: { id: ctx.organisationId },
		include: {
			_count: { select: { members: true, students: true } },
		},
	});

	if (!org) redirect("/dashboard");

	const isOwner = ctx.role === "OWNER";

	return (
		<div className="space-y-6 pt-8" style={{ fontFamily: "'Work Sans', sans-serif" }}>
			<div>
				<h1 className="text-2xl font-semibold text-[#3D4756]">Organisation Settings</h1>
				<p className="text-sm text-gray-500 mt-1">Manage your organisation details and team.</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 space-y-6">
					<div className="bg-white rounded-2xl shadow-sm p-6">
						<h2 className="text-lg font-medium text-gray-900 mb-4">General</h2>
						<form action={updateOrg} className="space-y-4">
							<label className="block">
								<div className="text-sm font-medium text-gray-700">Organisation name</div>
								<input
									name="name"
									defaultValue={org.name}
									required
									disabled={!isOwner}
									className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#584b53] disabled:bg-gray-50 disabled:text-gray-500"
								/>
							</label>
							<div>
								<div className="text-sm font-medium text-gray-700">Slug</div>
								<div className="mt-1 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border">{org.slug}</div>
							</div>
							{isOwner && (
								<button
									type="submit"
									className="bg-[#3D4756] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2A3441] transition-colors"
								>
									Save changes
								</button>
							)}
						</form>
					</div>

					<div className="bg-white rounded-2xl shadow-sm p-6">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-medium text-gray-900">Quick Stats</h2>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="bg-blue-50 rounded-xl p-4">
								<div className="text-2xl font-semibold text-blue-700">{org._count.members}</div>
								<div className="text-sm text-blue-600">Team members</div>
							</div>
							<div className="bg-green-50 rounded-xl p-4">
								<div className="text-2xl font-semibold text-green-700">{org._count.students}</div>
								<div className="text-sm text-green-600">Students</div>
							</div>
						</div>
					</div>
				</div>

				<div className="space-y-4">
					<Link
						href="/settings/members"
						className="block bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
					>
						<div className="flex items-center gap-3 mb-2">
							<svg className="w-5 h-5 text-[#3D4756]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
							<h3 className="font-medium text-gray-900">Team Members</h3>
						</div>
						<p className="text-sm text-gray-500">Manage staff, invite teachers, assign roles.</p>
					</Link>
					<Link
						href="/settings/billing"
						className="block bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow"
					>
						<div className="flex items-center gap-3 mb-2">
							<svg className="w-5 h-5 text-[#3D4756]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							<h3 className="font-medium text-gray-900">Billing Settings</h3>
						</div>
						<p className="text-sm text-gray-500">Default rates, discounts, and invoicing.</p>
					</Link>
				</div>
			</div>
		</div>
	);
}
