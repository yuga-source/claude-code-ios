import type { NextAuthConfig } from "next-auth";

// Edge-safe config (no bcrypt / Prisma here) so it can be used in middleware.
// The Credentials provider with DB access is added in auth.ts (Node runtime).
export const authConfig = {
  // Required when self-hosting (社内サーバー) — Auth.js v5 rejects the host
  // otherwise. Can also be set via AUTH_TRUST_HOST=true.
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const path = nextUrl.pathname;

      const managerOnly =
        path.startsWith("/dashboard") || path.startsWith("/import");
      if (managerOnly) return isLoggedIn && role === "MANAGER";
      if (path.startsWith("/tasks")) return isLoggedIn;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "MANAGER" | "MEMBER";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
