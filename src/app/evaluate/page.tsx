'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import type { Hypothesis } from '@/types/api';

const domains = [
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Mathematics',
  'Psychology',
  'Neuroscience',
  'Astronomy',
  'Environmental Science',
  'Medicine',
];

export default function EvaluatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hypothesis, setHypothesis] = useState<Hypothesis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [ratings, setRatings] = useState({
    novelty: 0,
    plausibility: 0,
    testability: 0,
  });
  const [comments, setComments] = useState('');

  const generateHypothesis = async (domain: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });

      if (!response.ok) throw new Error('Failed to generate hypothesis');
      const newHypothesis = await response.json();
      setHypothesis(newHypothesis);
    } catch (error) {
      console.error('Error generating hypothesis:', error);
      setError('Failed to generate hypothesis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && selectedDomain) {
      generateHypothesis(selectedDomain);
    }
  }, [status, selectedDomain]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hypothesis) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hypothesisId: hypothesis.id,
          novelty: ratings.novelty,
          plausibility: ratings.plausibility,
          testability: ratings.testability,
          comments,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit evaluation');
      }

      // Reset form and generate new hypothesis
      setRatings({ novelty: 0, plausibility: 0, testability: 0 });
      setComments('');
      await generateHypothesis(selectedDomain);
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      setError('Failed to submit evaluation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (!selectedDomain) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-200 mb-2">Select a Domain</h1>
          <p className="text-gray-300">Choose a scientific domain to evaluate hypotheses from.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {domains.map((domain, index) => (
            <motion.button
              key={domain}
              onClick={() => setSelectedDomain(domain)}
              className="p-6 bg-gray-800 rounded-lg shadow-sm border border-gray-700 hover:border-blue-500 transition-colors text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
            >
              <h2 className="text-xl font-semibold text-gray-200">{domain}</h2>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <motion.div 
        className="flex items-center justify-center min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Generating hypothesis...</p>
        </div>
      </motion.div>
    );
  }

  if (!hypothesis) {
    return (
      <motion.div 
        className="max-w-4xl mx-auto p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <p className="text-gray-600">No hypotheses available. Please try again later.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-200 mb-2">Evaluate Hypothesis</h1>
            <p className="text-gray-300">Rate the following hypothesis based on novelty, plausibility, and testability.</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setSelectedDomain('')}
          >
            Change Domain
          </Button>
        </div>
      </motion.div>

      <motion.div 
        className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-200 mb-2">Hypothesis</h2>
          <p className="text-gray-300">{hypothesis.content}</p>
        </div>
        <div className="text-sm text-gray-400">
          <p>Domain: {hypothesis.domain}</p>
        </div>
      </motion.div>

      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <AnimatePresence>
          {error && (
            <motion.div 
              className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="space-y-4">
          {[
            { key: 'novelty', label: 'Novelty (1-5)', description: 'How original and innovative is the hypothesis?' },
            { key: 'plausibility', label: 'Plausibility (1-5)', description: 'How well-supported is the hypothesis by existing knowledge?' },
            { key: 'testability', label: 'Testability (1-5)', description: 'How feasible is it to test this hypothesis?' }
          ].map((rating, index) => (
            <motion.div 
              key={rating.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-200 mb-2">
                {rating.label}
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={ratings[rating.key as keyof typeof ratings] === value ? 'default' : 'outline'}
                    onClick={() => setRatings(prev => ({ ...prev, [rating.key]: value }))}
                    className="flex-1"
                  >
                    {value}
                  </Button>
                ))}
              </div>
              <p className="mt-1 text-sm text-gray-400">{rating.description}</p>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Comments (Optional)
            </label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Share your thoughts on this hypothesis..."
              className="w-full"
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Button
            type="submit"
            disabled={isSubmitting || !ratings.novelty || !ratings.plausibility || !ratings.testability}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
          </Button>
        </motion.div>
      </motion.form>
    </div>
  );
} 