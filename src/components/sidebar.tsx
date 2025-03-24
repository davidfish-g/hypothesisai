'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const { data: session } = useSession();

  return (
    <div className="w-48 h-full bg-white border-r flex flex-col">
      <div className="p-4 border-b">
        <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-700">
          HypothesisAI
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <Link 
          href="/evaluate" 
          className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md hover:text-gray-900"
        >
          Evaluate
        </Link>
        <Link 
          href="/leaderboard" 
          className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md hover:text-gray-900"
        >
          Leaderboard
        </Link>
        <Link 
          href="/dashboard" 
          className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md hover:text-gray-900"
        >
          Dashboard
        </Link>
      </nav>

      <div className="p-4 space-y-4">
        <Link 
          href="/about" 
          className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md hover:text-gray-900"
        >
          About
        </Link>
        {session ? (
          <div className="space-y-2">
            <div className="px-4 py-2 text-sm text-gray-600">
              {session.user?.name}
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <Button
            className="w-full"
            onClick={() => signIn('google')}
          >
            Sign In with Google
          </Button>
        )}
      </div>
    </div>
  );
} 