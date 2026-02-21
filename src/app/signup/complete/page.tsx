import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import CompleteSignupClient from "./CompleteSignupClient";

export default async function CompleteSignupPage() {
	const session = await getServerSession(authOptions);

	if (!session?.user) {
		redirect("/signin");
	}

	const needOrg = (session.user as any).needOrg === true;
	if (!needOrg) {
		redirect("/students");
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<div className="max-w-md w-full bg-white border rounded-2xl shadow-sm p-8">
				<h2 className="text-2xl font-semibold mb-1 text-[#3D4756]">Set up your organisation</h2>
				<p className="text-sm text-gray-500 mb-6">
					Create a new organisation or join one with an invite link.
				</p>
				<CompleteSignupClient />
			</div>
		</div>
	);
}
