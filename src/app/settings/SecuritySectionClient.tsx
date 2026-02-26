"use client";

import { useState } from "react";

export default function SecuritySectionClient({ hasPassword }: { hasPassword: boolean }) {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const onChangePassword = async () => {
		setError(null);
		setSuccess(null);
		if (!hasPassword) return;
		if (!currentPassword) {
			setError("Current password is required.");
			return;
		}
		if (newPassword.length < 8) {
			setError("New password must be at least 8 characters.");
			return;
		}
		if (newPassword !== confirmPassword) {
			setError("New password and confirmation do not match.");
			return;
		}

		setSaving(true);
		try {
			const res = await fetch("/api/me/change-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ currentPassword, newPassword }),
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(data?.error || "Failed to change password");
			setSuccess("Password updated.");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (e: any) {
			setError(e?.message || "Failed to change password");
		} finally {
			setSaving(false);
		}
	};

	if (!hasPassword) {
		return (
			<div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
				Password changes aren’t available for accounts that sign in with Google.
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{error && (
				<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
					{error}
				</div>
			)}
			{success && (
				<div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
					{success}
				</div>
			)}

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<label className="block">
					<div className="text-sm font-medium text-gray-700">Current password</div>
					<input
						type="password"
						value={currentPassword}
						onChange={(e) => setCurrentPassword(e.target.value)}
						className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#584b53]"
					/>
				</label>
				<label className="block">
					<div className="text-sm font-medium text-gray-700">New password</div>
					<input
						type="password"
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#584b53]"
					/>
				</label>
				<label className="block">
					<div className="text-sm font-medium text-gray-700">Confirm new password</div>
					<input
						type="password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#584b53]"
					/>
				</label>
			</div>

			<button
				type="button"
				onClick={onChangePassword}
				disabled={saving}
				className="bg-[#3D4756] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2A3441] disabled:opacity-60 transition-colors"
			>
				{saving ? "Saving..." : "Change password"}
			</button>
		</div>
	);
}

