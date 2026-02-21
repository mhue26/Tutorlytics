"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * When session has needOrg (e.g. after accepting an invite), fetch current memberships
 * and update the session so the JWT gets organisationId/role and needOrg is cleared.
 * Normally middleware redirects needOrg users to /signup/complete; this handles edge
 * cases (e.g. client-side nav) where they land on a protected page.
 */
export default function SessionNeedOrgFix() {
	const { data: session, status, update } = useSession();
	const router = useRouter();
	const didFix = useRef(false);

	useEffect(() => {
		if (status !== "authenticated" || didFix.current) return;
		const needOrg = (session?.user as any)?.needOrg === true;
		if (!needOrg || !update) return;

		let cancelled = false;
		(async () => {
			try {
				const res = await fetch("/api/me/memberships");
				if (!res.ok || cancelled) return;
				const data = await res.json();
				if (Array.isArray(data) && data.length > 0 && !cancelled) {
					didFix.current = true;
					const first = data[0];
					await update({ organisationId: first.organisationId, role: first.role });
					router.refresh();
				}
			} catch {
				// ignore
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [status, session?.user, update, router]);

	return null;
}
