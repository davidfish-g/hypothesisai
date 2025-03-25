'use client';

import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
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

export default function DomainLeaderboard({ params }: { params: Promise<{ domain: string }> }) {
  const resolvedParams = use(params);
  const [models, setModels] = useState<ModelScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('overall');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const domain = decodeURIComponent(resolvedParams.domain);
  const formattedDomain = domain.charAt(0).toUpperCase() + domain.slice(1);

  useEffect(() => {
    const fetchDomainModels = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/hypotheses?domain=${encodeURIComponent(formattedDomain)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch domain models');
        }

        const hypotheses = await response.json();
        
        // Process hypotheses into model scores for the selected domain
        const modelScores = new Map<string, ModelScore>();
        
        hypotheses.forEach((hypothesis: any) => {
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
        console.error('Error fetching domain models:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDomainModels();
  }, [formattedDomain]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <motion.div 
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-200">
          {formattedDomain} Model Rankings
        </h1>
        <Button
          variant="outline"
          asChild
        >
          <Link href="/leaderboard">View Overall Rankings</Link>
        </Button>
      </motion.div>

      <motion.div 
        className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {isLoading ? (
          <div className="p-8 text-center text-gray-300">Loading...</div>
        ) : sortedModels.length === 0 ? (
          <div className="p-8 text-center text-gray-300">No data available</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
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
                {sortedModels.map((model, index) => (
                  <motion.tr 
                    key={model.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
                  >
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
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
} 