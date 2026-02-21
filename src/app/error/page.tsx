import { redirect } from "next/navigation";

/**
 * NextAuth redirects here on OAuth/callback failures (e.g. /error?error=OAuthCallback).
 * Redirect to signin so the user sees the error message on the sign-in page.
 */
export default async function ErrorPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
	const { error, callbackUrl } = await searchParams;
	const params = new URLSearchParams();
	if (error) params.set("error", error);
	if (callbackUrl) params.set("callbackUrl", callbackUrl);
	redirect(`/signin?${params.toString()}`);
}
