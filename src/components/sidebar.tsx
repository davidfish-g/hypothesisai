import { Link, useLocation } from 'react-router';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthActions, useSession } from '@/client/auth/auth-context';

export function Sidebar() {
  const { data: session } = useSession();
  const { signIn, signOut } = useAuthActions();
  const { pathname } = useLocation();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="w-50 h-full bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="p-4 ">
        <Link to="/" className="flex items-center gap-0 mt-3">
          <span className="text-lg font-bold text-gray-200 hover:text-gray-300 px-3">
            HypothesisAI
          </span>
          <img
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
          to="/evaluate" 
          className={cn(
            "block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md hover:text-gray-100 transition-colors",
            isActive('/evaluate') && "bg-blue-800 text-white hover:bg-blue-900"
          )}
        >
          Evaluate
        </Link>
        <Link 
          to="/leaderboard" 
          className={cn(
            "block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md hover:text-gray-100 transition-colors",
            isActive('/leaderboard') && "bg-blue-800 text-white hover:bg-blue-900"
          )}
        >
          Leaderboard
        </Link>
        <Link 
          to="/dashboard" 
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
          to="/about" 
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
              to="/profile" 
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
              onClick={() => void signOut()}
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <Button
            className="w-full text-sm"
            onClick={() => signIn('/dashboard')}
          >
            Sign In with Google
          </Button>
        )}
      </div>
    </div>
  );
} 
