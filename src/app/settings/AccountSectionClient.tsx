"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AccountSectionClient({
	initialName,
	initialEmail,
	initialImage,
	initialBio,
}: {
	initialName: string;
	initialEmail: string | null;
	initialImage: string | null;
	initialBio: string | null;
}) {
	const router = useRouter();
	const { update } = useSession();
	const [name, setName] = useState(initialName);
	const [image, setImage] = useState(initialImage ?? "");
	const [bio, setBio] = useState(initialBio ?? "");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const onSave = async () => {
		setError(null);
		setSuccess(null);
		const trimmedName = name.trim();
		if (!trimmedName) {
			setError("Name is required.");
			return;
		}
		setSaving(true);
		try {
			const res = await fetch("/api/me/profile", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: trimmedName,
					image: image.trim() || null,
					bio: bio.trim() || null,
				}),
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(data?.error || "Failed to update profile");

			// Update NextAuth token/session for header + sidebar UI immediately.
			await update({
				name: trimmedName,
				image: image.trim() || null,
				bio: bio.trim() || null,
			} as any);

			router.refresh();
			setSuccess("Saved.");
		} catch (e: any) {
			setError(e?.message || "Failed to update profile");
		} finally {
			setSaving(false);
		}
	};

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

			<label className="block">
				<div className="text-sm font-medium text-gray-700">Name</div>
				<input
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#584b53]"
				/>
			</label>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<label className="block">
					<div className="text-sm font-medium text-gray-700">Email</div>
					<input
						value={initialEmail ?? ""}
						disabled
						className="mt-1 w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500"
					/>
				</label>
				<label className="block">
					<div className="text-sm font-medium text-gray-700">Profile image URL</div>
					<input
						value={image}
						onChange={(e) => setImage(e.target.value)}
						placeholder="https://..."
						className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#584b53]"
					/>
				</label>
			</div>

			<label className="block">
				<div className="text-sm font-medium text-gray-700">Bio</div>
				<textarea
					value={bio}
					onChange={(e) => setBio(e.target.value)}
					rows={4}
					className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#584b53]"
				/>
			</label>

			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={onSave}
					disabled={saving}
					className="bg-[#3D4756] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2A3441] disabled:opacity-60 transition-colors"
				>
					{saving ? "Saving..." : "Save changes"}
				</button>
			</div>
		</div>
	);
}

