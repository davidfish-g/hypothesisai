'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
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
  const [ratings, setRatings] = useState({
    plausibility: 0,
    novelty: 0,
    testability: 0,
  });
  const [comments, setComments] = useState('');

  const fetchHypothesis = async () => {
    try {
      const response = await fetch('/api/hypotheses');
      if (!response.ok) throw new Error('Failed to fetch hypothesis');
      const data = await response.json();
      
      if (data.length === 0) {
        // If no hypotheses exist, generate a new one
        const randomDomain = domains[Math.floor(Math.random() * domains.length)];
        const generateResponse = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain: randomDomain }),
        });
        
        if (!generateResponse.ok) throw new Error('Failed to generate hypothesis');
        const newHypothesis = await generateResponse.json();
        setHypothesis(newHypothesis);
      } else {
        setHypothesis(data[0]);
      }
    } catch (error) {
      console.error('Error fetching hypothesis:', error);
      setError('Failed to load hypothesis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchHypothesis();
    }
  }, [status]);

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
          plausibility: ratings.plausibility,
          novelty: ratings.novelty,
          testability: ratings.testability,
          comments,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit evaluation');
      }

      // Reset form
      setRatings({ plausibility: 0, novelty: 0, testability: 0 });
      setComments('');

      // Generate a new hypothesis
      const randomDomain = domains[Math.floor(Math.random() * domains.length)];
      const generateResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: randomDomain }),
      });

      if (!generateResponse.ok) {
        throw new Error('Failed to generate new hypothesis');
      }

      const newHypothesis = await generateResponse.json();
      setHypothesis(newHypothesis);
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      setError('Failed to submit evaluation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || isLoading) {
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
    router.push('/auth/signin');
    return null;
  }

  if (!hypothesis) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <p className="text-gray-600">No hypotheses available. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Evaluate Hypothesis</h1>
        <p className="text-gray-600">Rate the following hypothesis based on plausibility, novelty, and testability.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Hypothesis</h2>
          <p className="text-gray-700">{hypothesis.content}</p>
        </div>
        <div className="text-sm text-gray-500">
          <p>Domain: {hypothesis.domain}</p>
          <p>Generated by: {hypothesis.modelName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plausibility (1-5)
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRatings({ ...ratings, plausibility: value })}
                  className={`w-10 h-10 rounded-full border ${
                    ratings.plausibility === value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:border-blue-600'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Novelty (1-5)
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRatings({ ...ratings, novelty: value })}
                  className={`w-10 h-10 rounded-full border ${
                    ratings.novelty === value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:border-blue-600'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Testability (1-5)
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRatings({ ...ratings, testability: value })}
                  className={`w-10 h-10 rounded-full border ${
                    ratings.testability === value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:border-blue-600'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments (Optional)
            </label>
            <Textarea
              value={comments}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComments(e.target.value)}
              placeholder="Share your thoughts about this hypothesis..."
              rows={4}
            />
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Evaluation'}
          </Button>
        </div>
      </form>
    </div>
  );
} 