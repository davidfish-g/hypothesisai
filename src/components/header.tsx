'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900">
              HypothesisAI
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link href="/leaderboard" className="text-gray-600 hover:text-gray-900">
                Leaderboard
              </Link>
              <Link href="/evaluate" className="text-gray-600 hover:text-gray-900">
                Evaluate
              </Link>
              {session && (
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <span className="text-gray-600">{session.user?.name}</span>
                <Button
                  variant="outline"
                  onClick={() => signOut()}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                onClick={() => signIn('google')}
              >
                Sign In with Google
              </Button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
} 