import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      if (!token) {
        return false;
      }
      return true;
    },
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/evaluate/:path*',
    '/api/evaluations/:path*',
    '/api/hypotheses/:path*',
  ],
}; 