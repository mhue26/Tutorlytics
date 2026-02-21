import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
	const pathname = req.nextUrl.pathname;
	const response = NextResponse.next();
	response.headers.set("x-pathname", pathname);

	const protectedRoutes = [
		"/home",
		"/students",
		"/dashboard",
		"/calendar",
		"/classes",
		"/billing",
		"/profile",
		"/schedule",
		"/settings",
	];
	const isProtectedRoute = protectedRoutes.some((route) =>
		pathname.startsWith(route)
	);

	if (isProtectedRoute) {
		const token = await getToken({
			req,
			secret: process.env.NEXTAUTH_SECRET,
		});

		if (!token) {
			const signInUrl = new URL("/signin", req.url);
			signInUrl.searchParams.set("callbackUrl", pathname);
			return NextResponse.redirect(signInUrl);
		}

		// Logged in but no organisation (e.g. new Google user): complete signup first
		if ((token as any).needOrg === true) {
			return NextResponse.redirect(new URL("/signup/complete", req.url));
		}
	}

	return response;
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
