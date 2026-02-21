import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function acceptInvite(formData: FormData) {
	"use server";
	const token = String(formData.get("token") || "");
	const session = await getServerSession(authOptions);
	if (!session?.user) return;

	const userId = (session.user as any).id as string;

	const invitation = await prisma.invitation.findUnique({ where: { token } });
	if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
		return;
	}

	const existingMember = await prisma.organisationMember.findUnique({
		where: {
			userId_organisationId: {
				userId,
				organisationId: invitation.organisationId,
			},
		},
	});

	if (!existingMember) {
		await prisma.organisationMember.create({
			data: {
				userId,
				organisationId: invitation.organisationId,
				role: invitation.role,
			},
		});
	}

	await prisma.invitation.update({
		where: { id: invitation.id },
		data: { acceptedAt: new Date() },
	});

	const params = new URLSearchParams({
		switchWorkspace: invitation.organisationId,
		switchRole: invitation.role,
	});
	redirect(`/dashboard?${params.toString()}`);
}

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
	const { token } = await params;
	const session = await getServerSession(authOptions);

	const invitation = await prisma.invitation.findUnique({
		where: { token },
		include: { organisation: { select: { name: true } } },
	});

	if (!invitation || invitation.acceptedAt || invitation.expiresAt < new Date()) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
				<div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
					<h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid or expired invitation</h2>
					<p className="text-sm text-gray-500 mb-4">
						This invitation link is no longer valid. Please ask your organisation admin for a new one.
					</p>
					<Link href="/signin" className="text-[#584b53] font-medium hover:underline text-sm">
						Go to sign in
					</Link>
				</div>
			</div>
		);
	}

	if (!session?.user) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
				<div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
					<h2 className="text-xl font-semibold text-gray-900 mb-2">
						You&apos;re invited to join {invitation.organisation.name}
					</h2>
					<p className="text-sm text-gray-500 mb-6">
						Sign in or create an account to accept this invitation.
					</p>
					<div className="flex flex-col gap-3">
						<a
							href={`/signin?callbackUrl=/invite/${token}`}
							className="bg-[#3D4756] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#2A3441] transition-colors"
						>
							Sign in
						</a>
						<a
							href="/signup"
							className="border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
						>
							Create account
						</a>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
				<h2 className="text-xl font-semibold text-gray-900 mb-2">
					Join {invitation.organisation.name}
				</h2>
				<p className="text-sm text-gray-500 mb-6">
					You&apos;ve been invited as a <span className="font-medium">{invitation.role.toLowerCase()}</span>.
				</p>
				<form action={acceptInvite}>
					<input type="hidden" name="token" value={token} />
					<button
						type="submit"
						className="w-full bg-[#3D4756] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#2A3441] transition-colors"
					>
						Accept invitation
					</button>
				</form>
			</div>
		</div>
	);
}
