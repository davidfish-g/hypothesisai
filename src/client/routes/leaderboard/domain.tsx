import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useParams } from 'react-router';
import { motion } from 'framer-motion';
import { domainFromPathParam } from '@/client/lib/domains';
import {
  aggregateModelScores,
  sortModelScores,
  type ModelScore,
  type SortDirection,
  type SortField,
} from '@/client/lib/model-scores';

const PAGE_SIZE = 25;

export default function DomainLeaderboard() {
  const resolvedParams = useParams<{ domain: string }>();
  const [models, setModels] = useState<ModelScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('overall');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(0);
  const formattedDomain = domainFromPathParam(resolvedParams.domain);

  useEffect(() => {
    const fetchDomainModels = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/hypotheses?domain=${encodeURIComponent(formattedDomain)}`);

        if (!response.ok) {
          throw new Error('Failed to fetch domain models');
        }

        const hypotheses = await response.json();
        setModels(aggregateModelScores(hypotheses));
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
    setPage(0);
  };

  const sortedModels = sortModelScores(models, sortField, sortDirection);

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
        <h1 className="text-3xl font-bold text-gray-200">
          {formattedDomain} Model Rankings
        </h1>
        <Button
          variant="outline"
          asChild
        >
          <Link to="/leaderboard">View Overall Rankings</Link>
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
    </div>
  );
}
