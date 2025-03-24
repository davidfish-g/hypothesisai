'use client';

import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Button asChild>
          <Link href="/evaluate">Start Evaluating</Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-gray-900">{session?.user?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{session?.user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Expertise</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {session?.user?.expertise?.map((domain) => (
                  <span
                    key={domain}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {domain}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistics</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Evaluations Completed</label>
              <p className="mt-1 text-2xl font-bold text-gray-900">0</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Average Rating</label>
              <p className="mt-1 text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <p className="text-gray-600">No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  );
} 