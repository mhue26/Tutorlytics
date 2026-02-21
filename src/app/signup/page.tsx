import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import GoogleSignUpButton from "./GoogleSignUpButton";

function generateSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 48);
}

async function doSignup(formData: FormData) {
	"use server";
	const name = String(formData.get("name") || "").trim() || null;
	const email = String(formData.get("email") || "").trim().toLowerCase();
	const password = String(formData.get("password") || "");
	const orgName = String(formData.get("orgName") || "").trim();

	if (!email || !password || !orgName) return;

	const existing = await prisma.user.findUnique({ where: { email } });
	if (!existing) {
		const passwordHash = await bcrypt.hash(password, 10);

		let slug = generateSlug(orgName);
		const slugExists = await prisma.organisation.findUnique({ where: { slug } });
		if (slugExists) {
			slug = `${slug}-${Date.now().toString(36)}`;
		}

		await prisma.$transaction(async (tx) => {
			const user = await tx.user.create({
				data: { name, email, passwordHash },
			});

			const org = await tx.organisation.create({
				data: { name: orgName, slug },
			});

			await tx.organisationMember.create({
				data: {
					userId: user.id,
					organisationId: org.id,
					role: "OWNER",
				},
			});
		});
	}
	redirect("/signin");
}

export default async function SignupPage() {
	const session = await getServerSession(authOptions);
	if (session?.user) redirect("/students");

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<div className="max-w-md w-full bg-white border rounded-2xl shadow-sm p-8">
				<h2 className="text-2xl font-semibold mb-1 text-[#3D4756]">Create your account</h2>
				<p className="text-sm text-gray-500 mb-6">Set up your organisation to get started.</p>
				<div className="space-y-4">
					<GoogleSignUpButton />
					<div className="flex items-center gap-3 text-gray-500">
						<div className="flex-1 h-px bg-gray-300" />
						<span className="text-xs font-medium">or</span>
						<div className="flex-1 h-px bg-gray-300" />
					</div>
				</div>
				<form action={doSignup} className="space-y-4 mt-4">
					<label className="block">
						<div className="text-sm font-medium text-gray-700">Organisation name</div>
						<input
							name="orgName"
							required
							placeholder="e.g. Bright Tutoring"
							className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#584b53] focus:border-transparent"
						/>
					</label>
					<label className="block">
						<div className="text-sm font-medium text-gray-700">Your name</div>
						<input
							name="name"
							placeholder="Full name"
							className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#584b53] focus:border-transparent"
						/>
					</label>
					<label className="block">
						<div className="text-sm font-medium text-gray-700">Email</div>
						<input
							name="email"
							type="email"
							required
							className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#584b53] focus:border-transparent"
						/>
					</label>
					<label className="block">
						<div className="text-sm font-medium text-gray-700">Password</div>
						<input
							name="password"
							type="password"
							required
							minLength={6}
							className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#584b53] focus:border-transparent"
						/>
					</label>
					<button className="rounded-lg bg-[#3D4756] text-white px-3 py-2.5 text-sm font-medium hover:bg-[#2A3441] w-full transition-colors">
						Create account
					</button>
				</form>
				<p className="text-xs text-gray-500 mt-4 text-center">
					Already have an account? <a href="/signin" className="text-[#584b53] font-medium hover:underline">Log in</a>
				</p>
			</div>
		</div>
	);
}
