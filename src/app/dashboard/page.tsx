'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { Evaluation } from '@/types/api';

type SortField = 'domain' | 'novelty' | 'plausibility' | 'testability' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);

  useEffect(() => {
    const fetchEvaluations = async () => {
      if (!session?.user?.email) return;
      
      setIsLoading(true);
      try {
        const response = await fetch('/api/evaluations');
        if (!response.ok) {
          throw new Error('Failed to fetch evaluations');
        }
        const data = await response.json();
        setEvaluations(data);
      } catch (error) {
        console.error('Error fetching evaluations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchEvaluations();
    }
  }, [status, session?.user?.email]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedEvaluations = [...evaluations].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    
    if (sortField === 'createdAt') {
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * multiplier;
    }
    
    if (sortField === 'domain') {
      return a.hypothesis.domain.localeCompare(b.hypothesis.domain) * multiplier;
    }
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return (aValue - bValue) * multiplier;
    }
    
    return 0;
  });

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
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div 
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-200">Dashboard</h1>
        <div className="text-sm text-gray-300">
          Welcome, {session.user.name}
        </div>
      </motion.div>

      <motion.div 
        className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-200">Start Evaluating</h2>
          <Button asChild>
            <Link href="/evaluate">Evaluate Hypotheses</Link>
          </Button>
        </div>
        <p className="text-gray-300">Help evaluate AI-generated scientific hypotheses and contribute to scientific knowledge.</p>
      </motion.div>

      {/* Evaluation History Section */}
      <motion.div 
        className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-gray-200">Your Evaluation History</h2>
        </div>
        
        {isLoading ? (
          <motion.div 
            className="p-8 text-center text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Loading evaluations...
          </motion.div>
        ) : evaluations.length === 0 ? (
          <motion.div 
            className="p-8 text-center text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            You haven't evaluated any hypotheses yet.
          </motion.div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  {[
                    { field: 'domain', label: 'Domain' },
                    { field: 'novelty', label: 'Novelty' },
                    { field: 'plausibility', label: 'Plausibility' },
                    { field: 'testability', label: 'Testability' },
                    { field: 'createdAt', label: 'Date' }
                  ].map(({ field, label }) => (
                    <th 
                      key={field}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-800"
                      onClick={() => handleSort(field as SortField)}
                    >
                      {label} {sortField === field && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {sortedEvaluations.map((evaluation, index) => (
                  <motion.tr 
                    key={evaluation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                      {evaluation.hypothesis.domain}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {evaluation.novelty.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {evaluation.plausibility.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {evaluation.testability.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(evaluation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedEvaluation(evaluation)}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 transition-colors cursor-pointer"
                      >
                        View
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedEvaluation && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedEvaluation(null)}
          >
            <motion.div 
              className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-gray-200">Evaluation Details</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedEvaluation(null)}
                    className="hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    Close
                  </Button>
                </div>
              </div>
              <div className="p-8 space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <h3 className="text-lg font-medium text-gray-200 mb-2">Hypothesis</h3>
                  <p className="text-gray-300">{selectedEvaluation.hypothesis.content}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <h3 className="text-lg font-medium text-gray-200 mb-2">Domain</h3>
                  <p className="text-gray-300">{selectedEvaluation.hypothesis.domain}</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <h3 className="text-lg font-medium text-gray-200 mb-2">Your Ratings</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Novelty</p>
                      <p className="text-gray-200">{selectedEvaluation.novelty.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Plausibility</p>
                      <p className="text-gray-200">{selectedEvaluation.plausibility.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Testability</p>
                      <p className="text-gray-200">{selectedEvaluation.testability.toFixed(1)}</p>
                    </div>
                  </div>
                </motion.div>
                {selectedEvaluation.comments && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <h3 className="text-lg font-medium text-gray-200 mb-2">Your Comments</h3>
                    <p className="text-gray-300">{selectedEvaluation.comments}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 