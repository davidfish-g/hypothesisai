'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  if (status === 'loading') {
    return (
      <motion.div
        className="flex items-center justify-center min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </motion.div>
    );
  }

  if (!session?.user) {
    router.push('/auth/signin');
    return null;
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError('');

    try {
      const response = await fetch('/api/account', { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleteError('Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-200">Profile</h1>
      </motion.div>

      {/* User Details */}
      <motion.div
        className="bg-gray-800 p-6 rounded-lg border border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center gap-4 mb-6">
          {session.user.image && (
            <Image
              src={session.user.image}
              alt={session.user.name || 'Profile'}
              width={64}
              height={64}
              className="rounded-full"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-200">{session.user.name}</h2>
            <p className="text-gray-400">{session.user.email}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-700">
            <span className="text-gray-400">Name</span>
            <span className="text-gray-200">{session.user.name}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-700">
            <span className="text-gray-400">Email</span>
            <span className="text-gray-200">{session.user.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-700">
            <span className="text-gray-400">Sign-in Provider</span>
            <span className="text-gray-200">Google</span>
          </div>
        </div>
      </motion.div>

      {/* Coming Soon: Expertise & Scholar ID */}
      <motion.div
        className="bg-gray-800 p-6 rounded-lg border border-gray-700 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="absolute top-3 right-3 bg-blue-900 text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
          Coming Soon
        </div>

        <h2 className="text-lg font-semibold text-gray-200 mb-4">Expert Profile</h2>

        <div className="space-y-4 opacity-50 pointer-events-none">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Areas of Expertise</label>
            <div className="flex flex-wrap gap-2">
              {['Physics', 'Biology', 'Chemistry'].map((domain) => (
                <span
                  key={domain}
                  className="bg-gray-700 text-gray-300 text-sm px-3 py-1 rounded-full"
                >
                  {domain}
                </span>
              ))}
              <span className="bg-gray-700 text-gray-500 text-sm px-3 py-1 rounded-full border border-dashed border-gray-600">
                + Add
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Google Scholar ID</label>
            <div className="bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-gray-500 text-sm">
              Enter your Google Scholar ID
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Soon you&apos;ll be able to link your expertise and Google Scholar profile to add credibility to your evaluations.
        </p>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        className="bg-gray-800 p-6 rounded-lg border border-red-900/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-400 mb-4">
          Permanently delete your account and all associated evaluations. This action cannot be undone.
        </p>

        {deleteError && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4 text-sm">
            {deleteError}
          </div>
        )}

        {!showDeleteConfirm ? (
          <Button
            variant="outline"
            className="border-red-800 text-red-400 hover:bg-red-900/30 hover:text-red-300"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Account
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-red-300 font-medium">
              Are you sure? This will permanently delete your account and all your evaluations.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-red-800 bg-red-900/30 text-red-300 hover:bg-red-900/50"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
