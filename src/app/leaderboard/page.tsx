'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

type ModelScore = {
  name: string;
  domain: string;
  novelty: number;
  plausibility: number;
  testability: number;
  totalEvaluations: number;
};

type SortField = 'name' | 'domain' | 'plausibility' | 'novelty' | 'testability' | 'totalEvaluations';
type SortDirection = 'asc' | 'desc';

// Temporary mock data for domains until we have an API endpoint
const mockDomains = [
  'Quantum Computing',
  'Machine Learning',
  'Neuroscience',
  'Physics',
  'Biology',
];

export default function Leaderboard() {
  const [models, setModels] = useState<ModelScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('plausibility');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    const fetchModels = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/hypotheses');
        
        if (!response.ok) {
          throw new Error('Failed to fetch models');
        }

        const hypotheses = await response.json();
        
        // Process hypotheses into model scores
        const modelScores = new Map<string, ModelScore>();
        
        hypotheses.forEach((hypothesis: any) => {
          const key = `${hypothesis.modelName}-${hypothesis.domain}`;
          const existing = modelScores.get(key) || {
            name: hypothesis.modelName,
            domain: hypothesis.domain,
            novelty: 0,
            plausibility: 0,
            testability: 0,
            totalEvaluations: 0,
          };

          // Calculate new averages correctly
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

          modelScores.set(key, {
            ...existing,
            totalEvaluations: newTotalEvaluations,
            novelty: newNovelty,
            plausibility: newPlausibility,
            testability: newTestability,
          });
        });

        setModels(Array.from(modelScores.values()));
      } catch (error) {
        console.error('Error fetching models:', error);
        // TODO: Show error toast
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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-600">Model Performance Leaderboard</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-600">Loading...</div>
        ) : models.length === 0 ? (
          <div className="p-8 text-center text-gray-600">No data available</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  Model {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('domain')}
                >
                  Domain {sortField === 'domain' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('novelty')}
                >
                  Novelty {sortField === 'novelty' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('plausibility')}
                >
                  Plausibility {sortField === 'plausibility' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('testability')}
                >
                  Testability {sortField === 'testability' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalEvaluations')}
                >
                  Evaluations {sortField === 'totalEvaluations' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedModels.map((model) => (
                <tr key={`${model.name}-${model.domain}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {model.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {model.domain}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {model.novelty.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {model.plausibility.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {model.testability.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {model.totalEvaluations}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">About the Ratings</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Novelty</h3>
            <p className="text-sm text-gray-600">
              How original and innovative is the hypothesis compared to existing theories?
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700">Plausibility</h3>
            <p className="text-sm text-gray-600">
              How well-supported is the hypothesis by existing scientific knowledge and evidence?
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700">Testability</h3>
            <p className="text-sm text-gray-600">
              How feasible is it to test and validate the hypothesis through experiments or observations?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 