'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Evaluation } from '@/types/api';

type SortField = 'domain' | 'plausibility' | 'novelty' | 'testability' | 'createdAt';
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-600">Dashboard</h1>
        <div className="text-sm text-gray-600">
          Welcome, {session.user.name}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Start Evaluating</h2>
          <Button asChild>
            <Link href="/evaluate">Evaluate Hypotheses</Link>
          </Button>
        </div>
        <p className="text-gray-600">Help evaluate AI-generated scientific hypotheses and contribute to scientific knowledge.</p>
      </div>

      {/* Evaluation History Section */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Your Evaluation History</h2>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-gray-600">Loading evaluations...</div>
        ) : evaluations.length === 0 ? (
          <div className="p-8 text-center text-gray-600">You haven't evaluated any hypotheses yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('domain')}
                  >
                    Domain {sortField === 'domain' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('plausibility')}
                  >
                    Plausibility {sortField === 'plausibility' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('novelty')}
                  >
                    Novelty {sortField === 'novelty' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('testability')}
                  >
                    Testability {sortField === 'testability' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('createdAt')}
                  >
                    Date {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedEvaluations.map((evaluation) => (
                  <tr key={evaluation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {evaluation.hypothesis.domain}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {evaluation.plausibility}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {evaluation.novelty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {evaluation.testability}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(evaluation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEvaluation(evaluation)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Evaluation Details Modal */}
      {selectedEvaluation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Evaluation Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEvaluation(null)}
                >
                  Close
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Hypothesis</h3>
                <p className="text-gray-700">{selectedEvaluation.hypothesis.content}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Domain</h3>
                <p className="text-gray-700">{selectedEvaluation.hypothesis.domain}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ratings</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Plausibility</p>
                    <p className="text-lg font-medium text-gray-900">{selectedEvaluation.plausibility}/5</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Novelty</p>
                    <p className="text-lg font-medium text-gray-900">{selectedEvaluation.novelty}/5</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Testability</p>
                    <p className="text-lg font-medium text-gray-900">{selectedEvaluation.testability}/5</p>
                  </div>
                </div>
              </div>
              {selectedEvaluation.comments && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your Comments</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedEvaluation.comments}</p>
                </div>
              )}
              <div className="text-sm text-gray-500">
                <p>Generated by: {selectedEvaluation.hypothesis.modelName}</p>
                <p>Evaluated on: {new Date(selectedEvaluation.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 