"use client";

import { useState } from "react";

interface Member {
	id: string;
	role: string;
	userId: string;
	user: { id: string; name: string | null; email: string | null; image: string | null };
}

interface PendingInvitation {
	id: string;
	email: string;
	role: string;
	token: string;
	expiresAt: string;
}

interface PendingJoinRequest {
	id: string;
	userId: string;
	role: string;
	createdAt: string;
	user: { id: string; name: string | null; email: string | null };
}

interface MembersClientProps {
	members: Member[];
	pendingInvitations: PendingInvitation[];
	joinCode: string | null;
	joinCodeExpiresAt: string | null;
	pendingJoinRequests: PendingJoinRequest[];
	currentUserId: string;
	currentRole: string;
	inviteAction: (formData: FormData) => Promise<void>;
	removeAction: (formData: FormData) => Promise<void>;
	updateRoleAction: (formData: FormData) => Promise<void>;
	cancelInvitationAction: (formData: FormData) => Promise<void>;
	generateJoinCodeAction: () => Promise<void>;
	approveJoinRequestAction: (formData: FormData) => Promise<void>;
	rejectJoinRequestAction: (formData: FormData) => Promise<void>;
}

const roleBadgeColors: Record<string, string> = {
	OWNER: "bg-purple-100 text-purple-800",
	ADMIN: "bg-blue-100 text-blue-800",
	TEACHER: "bg-green-100 text-green-800",
};

export default function MembersClient({
	members,
	pendingInvitations,
	joinCode,
	joinCodeExpiresAt,
	pendingJoinRequests,
	currentUserId,
	currentRole,
	inviteAction,
	removeAction,
	updateRoleAction,
	cancelInvitationAction,
	generateJoinCodeAction,
	approveJoinRequestAction,
	rejectJoinRequestAction,
}: MembersClientProps) {
	const [showInviteForm, setShowInviteForm] = useState(false);
	const [copiedToken, setCopiedToken] = useState<string | null>(null);
	const [copiedJoinCode, setCopiedJoinCode] = useState(false);
	const isOwnerOrAdmin = currentRole === "OWNER" || currentRole === "ADMIN";
	const isOwner = currentRole === "OWNER";

	const isJoinCodeValid =
		joinCode &&
		joinCodeExpiresAt &&
		new Date(joinCodeExpiresAt) > new Date();

	const copyInviteLink = (token: string) => {
		const link = `${window.location.origin}/invite/${token}`;
		navigator.clipboard.writeText(link);
		setCopiedToken(token);
		setTimeout(() => setCopiedToken(null), 2000);
	};

	const copyJoinCode = () => {
		if (joinCode) {
			navigator.clipboard.writeText(joinCode);
			setCopiedJoinCode(true);
			setTimeout(() => setCopiedJoinCode(false), 2000);
		}
	};

	return (
		<div className="space-y-6">
			{/* Join code (OWNER/ADMIN only) */}
			{isOwnerOrAdmin && (
				<div className="bg-white rounded-2xl shadow-sm p-6">
					<h2 className="text-lg font-medium text-gray-900 mb-4">Join code</h2>
					<p className="text-sm text-gray-500 mb-4">
						Share this code with people who want to join your organisation. It expires after 48 hours. They will need your approval to join.
					</p>
					{!isJoinCodeValid ? (
						<form action={generateJoinCodeAction}>
							<button
								type="submit"
								className="bg-[#3D4756] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2A3441] transition-colors"
							>
								Generate join code
							</button>
						</form>
					) : (
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<code className="text-lg font-mono font-semibold bg-gray-100 px-3 py-2 rounded-lg">
									{joinCode}
								</code>
								<button
									type="button"
									onClick={copyJoinCode}
									className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
								>
									{copiedJoinCode ? "Copied!" : "Copy"}
								</button>
							</div>
							<div className="text-xs text-gray-500">
								Expires {joinCodeExpiresAt ? new Date(joinCodeExpiresAt).toLocaleString() : ""}
							</div>
							<form action={generateJoinCodeAction}>
								<button
									type="submit"
									className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
								>
									Generate new code
								</button>
							</form>
						</div>
					)}
				</div>
			)}

			{/* Join requests (OWNER/ADMIN only) */}
			{isOwnerOrAdmin && pendingJoinRequests.length > 0 && (
				<div className="bg-white rounded-2xl shadow-sm p-6">
					<h2 className="text-lg font-medium text-gray-900 mb-4">
						Join requests ({pendingJoinRequests.length})
					</h2>
					<div className="divide-y divide-gray-100">
						{pendingJoinRequests.map((req) => (
							<div key={req.id} className="py-3 flex items-center justify-between">
								<div>
									<div className="text-sm font-medium text-gray-900">
										{req.user.name || "Unnamed"}
									</div>
									<div className="text-xs text-gray-500">
										{req.user.email} · requested {new Date(req.createdAt).toLocaleDateString()}
										{" · "}
										<span className={`${roleBadgeColors[req.role] || ""} px-1.5 py-0.5 rounded-full`}>
											{req.role}
										</span>
									</div>
								</div>
								<div className="flex gap-2">
									<form action={approveJoinRequestAction}>
										<input type="hidden" name="requestId" value={req.id} />
										<button
											type="submit"
											className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
										>
											Approve
										</button>
									</form>
									<form action={rejectJoinRequestAction}>
										<input type="hidden" name="requestId" value={req.id} />
										<button
											type="submit"
											className="text-sm text-red-600 hover:text-red-800 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
										>
											Reject
										</button>
									</form>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Current Members */}
			<div className="bg-white rounded-2xl shadow-sm p-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-medium text-gray-900">Members ({members.length})</h2>
					{isOwnerOrAdmin && (
						<button
							onClick={() => setShowInviteForm(!showInviteForm)}
							className="bg-[#3D4756] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2A3441] transition-colors"
						>
							+ Invite member
						</button>
					)}
				</div>

				{showInviteForm && (
					<form action={inviteAction} className="mb-6 p-4 bg-gray-50 rounded-xl space-y-3">
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
							<input
								name="email"
								type="email"
								required
								placeholder="Email address"
								className="sm:col-span-2 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#584b53]"
							/>
							<select
								name="role"
								className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#584b53]"
							>
								<option value="TEACHER">Teacher</option>
								<option value="ADMIN">Admin</option>
							</select>
						</div>
						<div className="flex gap-2">
							<button
								type="submit"
								className="bg-[#3D4756] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2A3441] transition-colors"
							>
								Send invite
							</button>
							<button
								type="button"
								onClick={() => setShowInviteForm(false)}
								className="text-gray-500 px-4 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors"
							>
								Cancel
							</button>
						</div>
					</form>
				)}

				<div className="divide-y divide-gray-100">
					{members.map((member) => (
						<div key={member.id} className="py-3 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-9 h-9 rounded-full bg-[#3D4756] flex items-center justify-center text-white text-sm font-medium">
									{(member.user.name || member.user.email || "?")[0].toUpperCase()}
								</div>
								<div>
									<div className="text-sm font-medium text-gray-900">
										{member.user.name || "Unnamed"}
										{member.userId === currentUserId && (
											<span className="text-gray-400 ml-1">(you)</span>
										)}
									</div>
									<div className="text-xs text-gray-500">{member.user.email}</div>
								</div>
							</div>
							<div className="flex items-center gap-2">
								{isOwner && member.role !== "OWNER" ? (
									<form action={updateRoleAction}>
										<input type="hidden" name="memberId" value={member.id} />
										<select
											name="role"
											defaultValue={member.role}
											onChange={(e) => e.currentTarget.form?.requestSubmit()}
											className="text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#584b53]"
										>
											<option value="ADMIN">Admin</option>
											<option value="TEACHER">Teacher</option>
										</select>
									</form>
								) : (
									<span className={`text-xs px-2 py-1 rounded-full font-medium ${roleBadgeColors[member.role] || "bg-gray-100 text-gray-800"}`}>
										{member.role}
									</span>
								)}
								{isOwner && member.role !== "OWNER" && (
									<form action={removeAction}>
										<input type="hidden" name="memberId" value={member.id} />
										<button
											type="submit"
											className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
											title="Remove member"
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
											</svg>
										</button>
									</form>
								)}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Pending Invitations */}
			{pendingInvitations.length > 0 && (
				<div className="bg-white rounded-2xl shadow-sm p-6">
					<h2 className="text-lg font-medium text-gray-900 mb-4">
						Pending Invitations ({pendingInvitations.length})
					</h2>
					<div className="divide-y divide-gray-100">
						{pendingInvitations.map((inv) => (
							<div key={inv.id} className="py-3 flex items-center justify-between">
								<div>
									<div className="text-sm font-medium text-gray-900">{inv.email}</div>
									<div className="text-xs text-gray-500">
										Expires {new Date(inv.expiresAt).toLocaleDateString("en-GB")}
										{" · "}
										<span className={`${roleBadgeColors[inv.role] || ""} px-1.5 py-0.5 rounded-full`}>
											{inv.role}
										</span>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<button
										onClick={() => copyInviteLink(inv.token)}
										className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
									>
										{copiedToken === inv.token ? "Copied!" : "Copy link"}
									</button>
									{isOwnerOrAdmin && (
										<form action={cancelInvitationAction}>
											<input type="hidden" name="invitationId" value={inv.id} />
											<button
												type="submit"
												className="text-sm text-red-500 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
											>
												Cancel
											</button>
										</form>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
