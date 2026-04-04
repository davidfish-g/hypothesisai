'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

type ModelScore = {
  name: string;
  novelty: number;
  plausibility: number;
  testability: number;
  overall: number;
  totalEvaluations: number;
};

type SortField = 'name' | 'plausibility' | 'novelty' | 'testability' | 'overall' | 'totalEvaluations';
type SortDirection = 'asc' | 'desc';

const PAGE_SIZE = 25;

const domains = [
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Mathematics',
  'Psychology',
  'Neuroscience',
  'Astronomy',
  'Medicine',
];

export default function Leaderboard() {
  const [models, setModels] = useState<ModelScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('overall');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchModels = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/hypotheses');

        if (!response.ok) {
          throw new Error('Failed to fetch models');
        }

        const hypotheses = await response.json();

        const modelScores = new Map<string, ModelScore>();

        hypotheses.forEach((hypothesis: { modelName: string; averageScores: { plausibility: number; novelty: number; testability: number } }) => {
          const key = hypothesis.modelName;
          const existing = modelScores.get(key) || {
            name: hypothesis.modelName,
            novelty: 0,
            plausibility: 0,
            testability: 0,
            overall: 0,
            totalEvaluations: 0,
          };

          const newTotalEvaluations = existing.totalEvaluations + 1;
          const newNovelty = existing.totalEvaluations === 0
            ? hypothesis.averageScores.novelty
            : (existing.novelty * existing.totalEvaluations + hypothesis.averageScores.novelty) / newTotalEvaluations;
          const newPlausibility = existing.totalEvaluations === 0
            ? hypothesis.averageScores.plausibility
            : (existing.plausibility * existing.totalEvaluations + hypothesis.averageScores.plausibility) / newTotalEvaluations;
          const newTestability = existing.totalEvaluations === 0
            ? hypothesis.averageScores.testability
            : (existing.testability * existing.totalEvaluations + hypothesis.averageScores.testability) / newTotalEvaluations;
          const newOverall = (newNovelty + newPlausibility + newTestability) / 3;

          modelScores.set(key, {
            ...existing,
            totalEvaluations: newTotalEvaluations,
            novelty: newNovelty,
            plausibility: newPlausibility,
            testability: newTestability,
            overall: newOverall,
          });
        });

        setModels(Array.from(modelScores.values()));
      } catch (error) {
        console.error('Error fetching models:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setPage(0);
  };

  const sortedModels = [...models].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * multiplier;
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return (aValue - bValue) * multiplier;
    }

    return 0;
  });

  const totalPages = Math.ceil(sortedModels.length / PAGE_SIZE);
  const pagedModels = sortedModels.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-200">Model Leaderboard</h1>
      </motion.div>

      <motion.div
        className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {isLoading ? (
          <div className="p-8 text-center text-gray-300">Loading models...</div>
        ) : models.length === 0 ? (
          <div className="p-8 text-center text-gray-300">No models available.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      #
                    </th>
                    {[
                      { field: 'name', label: 'Model' },
                      { field: 'novelty', label: 'Novelty' },
                      { field: 'plausibility', label: 'Plausibility' },
                      { field: 'testability', label: 'Testability' },
                      { field: 'overall', label: 'Overall' },
                      { field: 'totalEvaluations', label: 'Evaluations' }
                    ].map(({ field, label }) => (
                      <th
                        key={field}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-800"
                        onClick={() => handleSort(field as SortField)}
                      >
                        {label} {sortField === field && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {pagedModels.map((model, index) => (
                    <tr key={model.name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {page * PAGE_SIZE + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                        {model.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {model.novelty.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {model.plausibility.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {model.testability.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {model.overall.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {model.totalEvaluations}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-700">
                <span className="text-sm text-gray-400">
                  Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sortedModels.length)} of {sortedModels.length} models
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p - 1)}
                    disabled={page === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      <motion.div
        className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-gray-200 mb-4">View Rankings by Domain</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {domains.map((domain, index) => (
            <motion.div
              key={domain}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.05 }}
            >
              <Link
                href={`/leaderboard/${encodeURIComponent(domain.toLowerCase())}`}
                className="block p-6 bg-gray-800 rounded-lg shadow-sm border border-gray-700 hover:border-blue-500 transition-colors text-left"
              >
                <h2 className="text-xl font-semibold text-gray-200">{domain}</h2>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h2 className="text-lg font-semibold text-gray-200 mb-4">About the Ratings</h2>
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h3 className="text-sm font-medium text-gray-300">Novelty</h3>
            <p className="text-sm text-gray-400">
              How original and innovative is the hypothesis compared to existing theories?
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <h3 className="text-sm font-medium text-gray-300">Plausibility</h3>
            <p className="text-sm text-gray-400">
              How well-supported is the hypothesis by existing scientific knowledge and evidence?
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h3 className="text-sm font-medium text-gray-300">Testability</h3>
            <p className="text-sm text-gray-400">
              How feasible is it to test and validate the hypothesis through experiments or observations?
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
