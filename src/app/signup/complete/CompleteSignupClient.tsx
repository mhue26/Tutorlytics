"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { completeSignup, requestToJoinByCode } from "./actions";

type Mode = "choose" | "create" | "join";

export default function CompleteSignupClient() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [checkingMemberships, setCheckingMemberships] = useState(true);
	const [mode, setMode] = useState<Mode>("choose");
	const [inviteInput, setInviteInput] = useState("");
	const [joinRequestSent, setJoinRequestSent] = useState(false);
	const [createOrgName, setCreateOrgName] = useState("");
	const router = useRouter();
	const { data: session, update } = useSession();

	// If user just accepted an invite, they have memberships; refresh session and redirect
	useEffect(() => {
		const needOrg = (session?.user as any)?.needOrg === true;
		if (!needOrg || !update) {
			setCheckingMemberships(false);
			return;
		}
		let cancelled = false;
		(async () => {
			try {
				const res = await fetch("/api/me/memberships");
				if (!res.ok || cancelled) return;
				const data = await res.json();
				if (Array.isArray(data) && data.length > 0 && !cancelled) {
					const first = data[0];
					await update({ organisationId: first.organisationId, role: first.role });
					router.push("/students");
					return;
				}
			} catch {
				// ignore
			} finally {
				if (!cancelled) setCheckingMemberships(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [session?.user, update, router]);

	function parseInviteToken(input: string): string | null {
		const trimmed = input.trim();
		if (!trimmed) return null;
		try {
			if (trimmed.includes("/invite/")) {
				const match = trimmed.match(/\/invite\/([^/?#]+)/);
				return match ? match[1] : null;
			}
			return trimmed;
		} catch {
			return null;
		}
	}

	function looksLikeInviteToken(input: string): boolean {
		const trimmed = input.trim();
		if (trimmed.includes("/invite/")) return true;
		// Long hex token (e.g. 32+ chars) = email invite token
		if (/^[a-f0-9]{32,}$/i.test(trimmed)) return true;
		return false;
	}

	async function handleJoinSubmit(e: FormEvent) {
		e.preventDefault();
		setError(null);
		setJoinRequestSent(false);
		const input = inviteInput.trim();
		if (!input) {
			setError("Paste your invite link, organisation join code, or invite code from your admin.");
			return;
		}
		if (looksLikeInviteToken(input)) {
			const token = parseInviteToken(input);
			if (token) router.push(`/invite/${token}`);
			return;
		}
		setLoading(true);
		try {
			const result = await requestToJoinByCode(input);
			if (result.success) {
				setJoinRequestSent(true);
				setInviteInput("");
			} else {
				setError(result.error ?? "Something went wrong.");
			}
		} catch {
			setError("Something went wrong.");
		} finally {
			setLoading(false);
		}
	}

	async function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		const orgName = createOrgName.trim();
		if (!orgName) {
			setError("Organisation name is required");
			setLoading(false);
			return;
		}
		try {
			const result = await completeSignup(orgName);
			if (result?.organisationId && result?.role) {
				await update({ organisationId: result.organisationId, role: result.role });
				router.push("/students");
				return;
			}
			setError(result?.error ?? "Something went wrong");
		} catch {
			setError("Something went wrong");
		} finally {
			setLoading(false);
		}
	}

	if (checkingMemberships) {
		return (
			<div className="text-sm text-gray-500 text-center py-4">Checking…</div>
		);
	}

	if (mode === "choose") {
		return (
			<div className="space-y-3">
				<button
					type="button"
					onClick={() => {
					setMode("create");
					setCreateOrgName(`${(session?.user as any)?.name || "My"}'s Workspace`);
				}}
					className="w-full rounded-lg bg-[#3D4756] text-white px-3 py-2.5 text-sm font-medium hover:bg-[#2A3441] transition-colors border-0 text-left flex items-center justify-between"
				>
					<span>Create organisation</span>
					<span aria-hidden>→</span>
				</button>
				<button
					type="button"
					onClick={() => setMode("join")}
					className="w-full rounded-lg border-2 border-[#584b53] text-[#3D4756] px-3 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors text-left flex items-center justify-between"
				>
					<span>Join organisation</span>
					<span aria-hidden>→</span>
				</button>
			</div>
		);
	}

	if (mode === "join") {
		return (
			<div className="space-y-4">
				<button
					type="button"
					onClick={() => { setMode("choose"); setError(null); setInviteInput(""); setJoinRequestSent(false); }}
					className="text-sm text-[#584b53] hover:underline"
				>
					← Back
				</button>
				{joinRequestSent ? (
					<div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
						Request sent. The organisation admin will notify you once your request is approved. You can close this page or sign out; you will have access once they approve.
					</div>
				) : (
					<>
						<p className="text-sm text-gray-600">
							Paste an invite link (from an email invite), or the organisation join code from your admin.
						</p>
						<form onSubmit={handleJoinSubmit} className="space-y-3">
							<label className="block">
								<div className="text-sm font-medium text-gray-700 sr-only">Invite link or join code</div>
								<input
									type="text"
									value={inviteInput}
									onChange={(e) => setInviteInput(e.target.value)}
									placeholder="e.g. https://…/invite/abc123 or organisation join code"
									className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#584b53] focus:border-transparent"
								/>
							</label>
							{error && <div className="text-sm text-red-600">{error}</div>}
							<button
								type="submit"
								disabled={loading}
								className="rounded-lg bg-[#3D4756] text-white px-3 py-2.5 text-sm font-medium hover:bg-[#2A3441] w-full transition-colors disabled:opacity-50"
							>
								{loading ? "Submitting…" : "Continue"}
							</button>
						</form>
					</>
				)}
			</div>
		);
	}

	// mode === "create"
	return (
		<div className="space-y-4">
			<button
				type="button"
				onClick={() => { setMode("choose"); setError(null); setCreateOrgName(""); }}
				className="text-sm text-[#584b53] hover:underline"
			>
				← Back
			</button>
			<form onSubmit={onSubmit} className="space-y-4">
				<label className="block">
					<div className="text-sm font-medium text-gray-700">Organisation name</div>
					<input
						name="orgName"
						required
						value={createOrgName}
						onChange={(e) => setCreateOrgName(e.target.value)}
						placeholder="e.g. Bright Tutoring"
						className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#584b53] focus:border-transparent"
					/>
				</label>
				{error && <div className="text-sm text-red-600">{error}</div>}
				<button
					type="submit"
					disabled={loading}
					className="rounded-lg bg-[#3D4756] text-white px-3 py-2.5 text-sm font-medium hover:bg-[#2A3441] w-full transition-colors disabled:opacity-50"
				>
					{loading ? "Creating…" : "Create organisation"}
				</button>
			</form>
		</div>
	);
}
