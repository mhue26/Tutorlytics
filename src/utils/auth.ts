import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";

export const authOptions: NextAuthOptions = {
	secret: process.env.NEXTAUTH_SECRET,
	session: { strategy: "jwt" },
	pages: {
		signIn: "/signin",
	},
	logger: {
		error(code, metadata) {
			// Suppress JWT_SESSION_ERROR (common when cookies are invalid)
			if (code === "JWT_SESSION_ERROR") {
				return;
			}
			// Log other errors normally
			console.error("[next-auth][error]", code, metadata);
		},
	},
	providers: [
		Credentials({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				// #region agent log
				fetch('http://127.0.0.1:7242/ingest/175c5cc9-0563-48f8-b397-7b7e227ddec8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:19',message:'authorize called',data:{email:credentials?.email?.substring(0,5)+'***',hasPassword:!!credentials?.password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
				// #endregion
				const email = String(credentials?.email || "").trim().toLowerCase();
				const password = String(credentials?.password || "");
				if (!email || !password) {
					// #region agent log
					fetch('http://127.0.0.1:7242/ingest/175c5cc9-0563-48f8-b397-7b7e227ddec8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:24',message:'missing credentials',data:{hasEmail:!!email,hasPassword:!!password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
					// #endregion
					return null;
				}
				try {
					// #region agent log
					fetch('http://127.0.0.1:7242/ingest/175c5cc9-0563-48f8-b397-7b7e227ddec8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:28',message:'before prisma query',data:{email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
					// #endregion
					const user = await prisma.user.findUnique({ where: { email } });
					// #region agent log
					fetch('http://127.0.0.1:7242/ingest/175c5cc9-0563-48f8-b397-7b7e227ddec8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:30',message:'after prisma query',data:{userFound:!!user,hasPasswordHash:!!user?.passwordHash,userId:user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
					// #endregion
					if (!user || !user.passwordHash) {
						// #region agent log
						fetch('http://127.0.0.1:7242/ingest/175c5cc9-0563-48f8-b397-7b7e227ddec8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:33',message:'user not found or no password hash',data:{userFound:!!user,hasPasswordHash:!!user?.passwordHash},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
						// #endregion
						return null;
					}
					// #region agent log
					fetch('http://127.0.0.1:7242/ingest/175c5cc9-0563-48f8-b397-7b7e227ddec8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:37',message:'before bcrypt compare',data:{hashLength:user.passwordHash?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
					// #endregion
					const ok = await bcrypt.compare(password, user.passwordHash);
					// #region agent log
					fetch('http://127.0.0.1:7242/ingest/175c5cc9-0563-48f8-b397-7b7e227ddec8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:40',message:'after bcrypt compare',data:{passwordMatch:ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
					// #endregion
					if (!ok) {
						// #region agent log
						fetch('http://127.0.0.1:7242/ingest/175c5cc9-0563-48f8-b397-7b7e227ddec8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:43',message:'password mismatch',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
						// #endregion
						return null;
					}
					// #region agent log
					fetch('http://127.0.0.1:7242/ingest/175c5cc9-0563-48f8-b397-7b7e227ddec8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:47',message:'authorize success',data:{userId:user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
					// #endregion
					return { id: user.id, name: user.name ?? null, email: user.email ?? null } as any;
				} catch (error) {
					// #region agent log
					fetch('http://127.0.0.1:7242/ingest/175c5cc9-0563-48f8-b397-7b7e227ddec8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:51',message:'authorize error',data:{errorMessage:error instanceof Error?error.message:'unknown',errorName:error instanceof Error?error.name:'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
					// #endregion
					throw error;
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			// #region agent log
			fetch('http://127.0.0.1:7242/ingest/175c5cc9-0563-48f8-b397-7b7e227ddec8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:56',message:'jwt callback',data:{hasUser:!!user,userId:user?(user as any).id:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
			// #endregion
			if (user) {
				token.id = (user as any).id;
			}
			return token;
		},
		async session({ session, token }) {
			// #region agent log
			fetch('http://127.0.0.1:7242/ingest/175c5cc9-0563-48f8-b397-7b7e227ddec8',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.ts:63',message:'session callback',data:{hasSessionUser:!!session.user,hasTokenId:!!token?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
			// #endregion
			if (session.user && token?.id) {
				(session.user as any).id = token.id as string;
			}
			return session;
		},
	},
};

export const auth = () => getServerSession(authOptions);


