'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="w-50 h-full bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 ">
        <Link href="/" className="flex items-center gap-0 mt-3">
          <span className="text-lg font-bold text-gray-200 hover:text-gray-300 px-3">
            HypothesisAI
          </span>
          <Image
            src="/logo.png"
            alt="HypothesisAI Logo"
            width={32}
            height={32}
            className="hover:opacity-80 transition-opacity -ml-3"
          />
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 -mt-3">
        <Link 
          href="/evaluate" 
          className={cn(
            "block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md hover:text-gray-100 transition-colors",
            isActive('/evaluate') && "bg-blue-800 text-white hover:bg-blue-900"
          )}
        >
          Evaluate
        </Link>
        <Link 
          href="/leaderboard" 
          className={cn(
            "block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md hover:text-gray-100 transition-colors",
            isActive('/leaderboard') && "bg-blue-800 text-white hover:bg-blue-900"
          )}
        >
          Leaderboard
        </Link>
        <Link 
          href="/dashboard" 
          className={cn(
            "block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md hover:text-gray-100 transition-colors",
            isActive('/dashboard') && "bg-blue-800 text-white hover:bg-blue-900"
          )}
        >
          Dashboard
        </Link>
      </nav>

      <div className="p-4 space-y-1">
        <Link 
          href="/about" 
          className={cn(
            "block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md hover:text-gray-100 transition-colors",
            isActive('/about') && "bg-blue-800 text-white hover:bg-blue-900"
          )}
        >
          About
        </Link>
        {session ? (
          <div className="space-y-1">
            <Link 
              href="/profile" 
              className={cn(
                "block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md hover:text-gray-100 transition-colors",
                isActive('/profile') && "bg-blue-800 text-white hover:bg-blue-900"
              )}
            >
              Profile
            </Link>
            <Button
              variant="outline"
              className="w-full text-sm"
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <Button
            className="w-full text-sm"
            onClick={() => signIn('google')}
          >
            Sign In with Google
          </Button>
        )}
      </div>
    </div>
  );
} 