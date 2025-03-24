import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
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