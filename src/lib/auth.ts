import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { sql } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const result = await sql`
          SELECT * FROM users WHERE email = ${credentials.email as string}
        `;

        const user = result.rows[0];
        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!isValid) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

/**
 * Check authentication, but bypass when DEV_BYPASS_AUTH is set in non-production env.
 * Production deployments will always require real auth — bypass flag is ignored when NODE_ENV=production.
 */
export async function checkAuth() {
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_BYPASS_AUTH === "true"
  ) {
    return {
      user: {
        id: "1",
        name: "Admin SMPN 5",
        email: "admin@smpn5klaten.sch.id",
        role: "admin",
      },
    };
  }
  return await auth();
}
