import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
	// Set x-pathname header for server-side pathname access
	const pathname = req.nextUrl.pathname;
	const response = NextResponse.next();
	response.headers.set("x-pathname", pathname);
	
	// Protected routes that require authentication
	const protectedRoutes = ["/students", "/dashboard", "/calendar", "/classes", "/billing", "/profile", "/schedule"];
	const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
	
	// Check authentication for protected routes
	if (isProtectedRoute) {
		const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
		
		if (!token) {
			// Redirect to signin if not authenticated
			const signInUrl = new URL("/signin", req.url);
			signInUrl.searchParams.set("callbackUrl", pathname);
			return NextResponse.redirect(signInUrl);
		}
	}
	
	return response;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public files (public folder)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};


