import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin?: boolean;
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }
        const adminEmail = process.env.ADMIN_EMAIL;
        session.user.isAdmin = !!(
          session.user.email &&
          adminEmail &&
          session.user.email.toLowerCase() === adminEmail.toLowerCase()
        );
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      // Force the stable Google ID (profile.sub) to be the token sub.
      // Auth.js v5 generates a random UUID for user.id without a DB adapter.
      if (profile?.sub) {
        token.sub = profile.sub;
      } else if (account?.providerAccountId) {
        token.sub = account.providerAccountId;
      } else if (user?.id && !token.sub) {
        token.sub = user.id;
      }
      return token;
    },
  },
  session: { strategy: "jwt" },
});

