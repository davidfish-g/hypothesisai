import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PgAdapter } from '@/lib/auth-adapter';

const handler = NextAuth({
  adapter: PgAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.expertise = token.expertise as string[] || [];
        session.user.scholarId = token.scholarId as string || null;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.expertise = user.expertise;
        token.scholarId = user.scholarId;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };
