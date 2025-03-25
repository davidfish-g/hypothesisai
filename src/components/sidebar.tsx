'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const { data: session } = useSession();

  return (
    <div className="w-50 h-full bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <Link href="/" className="text-xl font-bold text-gray-200 hover:text-gray-300">
          HypothesisAI
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <Link 
          href="/evaluate" 
          className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md hover:text-gray-100"
        >
          Evaluate
        </Link>
        <Link 
          href="/leaderboard" 
          className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md hover:text-gray-100"
        >
          Leaderboard
        </Link>
        <Link 
          href="/dashboard" 
          className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md hover:text-gray-100"
        >
          Dashboard
        </Link>
      </nav>

      <div className="p-4 space-y-1">
        <Link 
          href="/about" 
          className="block px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-md hover:text-gray-100"
        >
          About
        </Link>
        {session ? (
          <div className="space-y-2">
            <div className="px-4 py-2 text-sm text-gray-300">
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