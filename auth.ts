import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const ALLOWED_EMAIL_DOMAIN = "laolabuena.com";

export function isAllowedEmail(email?: string | null) {
  if (!email) return false;

  const normalizedEmail = email.trim().toLowerCase();
  return normalizedEmail.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          hd: ALLOWED_EMAIL_DOMAIN,
          prompt: "select_account",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    signIn({ profile }) {
      return profile?.email_verified === true && isAllowedEmail(profile.email);
    },
    jwt({ token, profile }) {
      if (profile?.picture) token.picture = profile.picture;
      return token;
    },
    session({ session, token }) {
      if (session.user && typeof token.picture === "string") {
        session.user.image = token.picture;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
});
