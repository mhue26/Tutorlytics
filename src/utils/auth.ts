import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";

function slugFromName(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 48);
}

/**
 * Create the user's personal workspace if they don't have one.
 * Idempotent: safe to call on every request; only creates when missing.
 */
export async function createPersonalWorkspaceIfMissing(
	userId: string,
	userName: string | null
): Promise<void> {
	const hasPersonal = await prisma.organisation.findFirst({
		where: { ownerId: userId },
		select: { id: true },
	});
	if (hasPersonal) return;

	const name = `${String(userName || "My").trim()}'s Workspace`;
	let slug = slugFromName(name);
	const slugExists = await prisma.organisation.findUnique({ where: { slug } });
	if (slugExists) slug = `${slug}-${Date.now().toString(36)}`;

	const org = await prisma.organisation.create({
		data: { name, slug, ownerId: userId },
	});
	await prisma.organisationMember.create({
		data: { userId, organisationId: org.id, role: "OWNER" },
	});
}

/**
 * Ensure the user has an individual (personal) workspace; it is the default.
 * If they have no memberships, create one. If they have org memberships but no personal, create personal.
 * Return the workspace to use for this session: prefer personal workspace, else first membership.
 */
async function ensurePersonalWorkspaceAndGetDefault(
	userId: string,
	userName: string | null
): Promise<{ organisationId: string; role: string }> {
	// Ensure personal workspace exists (creates only when missing)
	await createPersonalWorkspaceIfMissing(userId, userName);

	const memberships = await prisma.organisationMember.findMany({
		where: { userId },
		orderBy: { createdAt: "asc" },
		select: {
			organisationId: true,
			role: true,
			organisation: { select: { ownerId: true } },
		},
	});

	const personal = memberships.find((m) => m.organisation.ownerId === userId);
	if (personal) return { organisationId: personal.organisationId, role: personal.role };
	if (memberships.length > 0)
		return { organisationId: memberships[0].organisationId, role: memberships[0].role };

	// Edge case: create succeeded but fetch missed it; use first membership
	const again = await prisma.organisationMember.findFirst({
		where: { userId },
		select: { organisationId: true, role: true },
	});
	if (again) return { organisationId: again.organisationId, role: again.role };
	throw new Error("Failed to ensure personal workspace");
}

export const authOptions: NextAuthOptions = {
	secret: process.env.NEXTAUTH_SECRET,
	session: { strategy: "jwt" },
	debug: process.env.NODE_ENV === "development",
	pages: {
		signIn: "/signin",
		error: "/signin", // so OAuth errors redirect to signin with ?error=...
	},
		logger: {
		error(code, metadata) {
			if (code === "JWT_SESSION_ERROR") return;
			console.error("[next-auth][error]", code);
			// Log full error message and stack so you can see the real cause in the terminal
			const err =
				metadata && typeof metadata === "object" && "error" in metadata
					? (metadata as { error: Error }).error
					: metadata;
			if (err instanceof Error) {
				console.error(err.message);
				if (err.stack) console.error(err.stack);
				if (err.cause) console.error("Cause:", err.cause);
			} else {
				console.error(metadata);
			}
		},
	},
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID ?? "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
		}),
		Credentials({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				const email = String(credentials?.email || "").trim().toLowerCase();
				const password = String(credentials?.password || "");
				if (!email || !password) return null;

				const user = await prisma.user.findUnique({ where: { email } });
				if (!user || !user.passwordHash) return null;

				const ok = await bcrypt.compare(password, user.passwordHash);
				if (!ok) return null;

				const { organisationId, role } = await ensurePersonalWorkspaceAndGetDefault(
					user.id,
					user.name ?? null
				);

				return {
					id: user.id,
					name: user.name ?? null,
					email: user.email ?? null,
					organisationId,
					role,
				} as any;
			},
		}),
	],
	callbacks: {
		async jwt({ token, user, account, trigger, session }) {
			// First OAuth sign-in (Google): find or create user, set token from DB
			if (account?.provider === "google" && user?.email) {
				try {
					const email = String(user.email).trim().toLowerCase();
					let dbUser = await prisma.user.findUnique({ where: { email } });
					if (!dbUser) {
						dbUser = await prisma.user.create({
							data: {
								name: user.name ?? null,
								email,
								image: user.image ?? null,
								emailVerified: new Date(),
								passwordHash: null,
							},
						});
					}
					const { organisationId, role } = await ensurePersonalWorkspaceAndGetDefault(
						dbUser.id,
						dbUser.name ?? null
					);
					token.id = dbUser.id;
					token.organisationId = organisationId;
					token.role = role;
					delete (token as any).needOrg;
				} catch (err) {
					console.error("[next-auth] Google JWT callback error:", err);
					throw err;
				}
				return token;
			}
			// Credentials sign-in: user object from authorize()
			if (user) {
				token.id = (user as any).id;
				token.organisationId = (user as any).organisationId;
				token.role = (user as any).role;
			}
			// Session update (complete signup or after accepting invite)
			if (trigger === "update" && session?.organisationId != null) {
				token.organisationId = session.organisationId;
				token.role = session.role;
				delete (token as any).needOrg;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user && token?.id) {
				(session.user as any).id = token.id as string;
				(session.user as any).organisationId = token.organisationId as string | null;
				(session.user as any).role = token.role as string | null;
				(session.user as any).needOrg = (token as any).needOrg ?? false;
			}
			return session;
		},
	},
};

export const auth = () => getServerSession(authOptions);

export interface OrgContext {
	userId: string;
	organisationId: string;
	role: "OWNER" | "ADMIN" | "TEACHER";
}

/**
 * Returns the authenticated user's org context, or null if not authenticated
 * or not a member of any organisation.
 */
export async function getOrgContext(): Promise<OrgContext | null> {
	const session = await getServerSession(authOptions);
	if (!session?.user) return null;

	const userId = (session.user as any).id as string;
	const organisationId = (session.user as any).organisationId as string | null;
	const role = (session.user as any).role as string | null;

	if (!organisationId || !role) return null;

	return { userId, organisationId, role: role as OrgContext["role"] };
}

/**
 * Same as getOrgContext but throws a redirect-friendly error for use in
 * server components / actions that must have org context.
 */
export async function requireOrgContext(): Promise<OrgContext> {
	const ctx = await getOrgContext();
	if (!ctx) {
		throw new Error("Not authenticated or no organisation context");
	}
	return ctx;
}
