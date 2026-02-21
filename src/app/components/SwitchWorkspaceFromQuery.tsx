"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

/**
 * When redirecting from invite accept, URL has ?switchWorkspace=...&switchRole=...
 * This component applies that workspace to the session and then strips the query.
 */
export default function SwitchWorkspaceFromQuery() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { update: updateSession } = useSession();
	const applied = useRef(false);

	useEffect(() => {
		const orgId = searchParams.get("switchWorkspace");
		const role = searchParams.get("switchRole");
		if (!orgId || !role || applied.current) return;

		applied.current = true;
		updateSession?.({ organisationId: orgId, role: role as "OWNER" | "ADMIN" | "TEACHER" })
			.then(() => {
				router.replace("/dashboard");
			})
			.catch(() => {});
	}, [searchParams, updateSession, router]);

	return null;
}
