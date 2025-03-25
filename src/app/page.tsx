'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

type ModelScore = {
  name: string;
  overall: number;
  totalEvaluations: number;
};

type DomainLeaderboard = {
  domain: string;
  models: ModelScore[];
};

export default function Home() {
  const [leaderboards, setLeaderboards] = useState<DomainLeaderboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDomainLeaderboards = async () => {
      setIsLoading(true);
      try {
        const domains = ['Biology', 'Physics', 'Chemistry'];
        const leaderboardData: DomainLeaderboard[] = [];

        for (const domain of domains) {
          const response = await fetch(`/api/hypotheses?domain=${encodeURIComponent(domain)}`);
          if (!response.ok) throw new Error(`Failed to fetch ${domain} data`);
          
          const hypotheses = await response.json();
          
          // Process hypotheses into model scores
          const modelScores = new Map<string, ModelScore>();
          
          hypotheses.forEach((hypothesis: any) => {
            const key = hypothesis.modelName;
            const existing = modelScores.get(key) || {
              name: hypothesis.modelName,
              overall: 0,
              totalEvaluations: 0,
            };

            const newTotalEvaluations = existing.totalEvaluations + 1;
            const newOverall = existing.totalEvaluations === 0 
              ? (hypothesis.averageScores.novelty + hypothesis.averageScores.plausibility + hypothesis.averageScores.testability) / 3
              : (existing.overall * existing.totalEvaluations + 
                (hypothesis.averageScores.novelty + hypothesis.averageScores.plausibility + hypothesis.averageScores.testability) / 3) 
                / newTotalEvaluations;

            modelScores.set(key, {
              ...existing,
              totalEvaluations: newTotalEvaluations,
              overall: newOverall,
            });
          });

          // Sort models by overall score and take top 3
          const topModels = Array.from(modelScores.values())
            .sort((a, b) => b.overall - a.overall)
            .slice(0, 3);

          leaderboardData.push({
            domain,
            models: topModels,
          });
        }

        setLeaderboards(leaderboardData);
      } catch (error) {
        console.error('Error fetching leaderboards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDomainLeaderboards();
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12">
        <motion.h1 
          className="text-4xl md:text-6xl font-bold text-gray-200 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Evaluate AI-Generated Scientific Hypotheses
        </motion.h1>
        <motion.p 
          className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Join our community of domain experts to evaluate and improve AI-generated scientific hypotheses. Help shape the future of AI in scientific research.
        </motion.p>
        <motion.div 
          className="flex justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button asChild size="lg">
            <Link href="/evaluate">Start Evaluating</Link>
          </Button>
          <Button variant="outline" size="lg">
            <Link href="/leaderboard">View Leaderboard</Link>
          </Button>
        </motion.div>
      </section>

      {/* Domain Leaderboards */}
      <section>
        <motion.div 
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-200">Domain Leaderboards</h2>
          <Link href="/leaderboard" className="text-blue-400 hover:text-blue-300">View All</Link>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {isLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <motion.div 
                  key={i}
                  className="p-6 bg-gray-800 rounded-lg shadow-sm border border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                >
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-700 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="flex justify-between items-center">
                          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                          <div className="h-4 bg-gray-700 rounded w-8"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          ) : (
            leaderboards.map((leaderboard, index) => (
              <motion.div
                key={leaderboard.domain}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              >
                <Link
                  href={`/leaderboard/${encodeURIComponent(leaderboard.domain.toLowerCase())}`}
                  className="block p-6 bg-gray-800 rounded-lg shadow-sm border border-gray-700 hover:border-blue-500 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-gray-200 mb-4">{leaderboard.domain}</h3>
                  <p className="text-gray-400 mb-4">Top AI Models</p>
                  <div className="space-y-3">
                    {leaderboard.models.map((model, index) => (
                      <div key={model.name} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-200">#{index + 1}</span>
                          <span className="text-gray-300">{model.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">★</span>
                          <span className="text-gray-300">{model.overall.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="text-center">
        <motion.h2 
          className="text-3xl font-bold text-gray-200 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          How It Works
        </motion.h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: 1, title: "Sign Up", description: "Create an account and verify your expertise" },
            { step: 2, title: "Select Domain", description: "Choose your field of expertise" },
            { step: 3, title: "Evaluate", description: "Rate hypotheses on novelty, plausibility, and testability" },
            { step: 4, title: "Track Progress", description: "Monitor your contributions and model rankings" }
          ].map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
            >
              <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-300 font-bold">{item.step}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-200 mb-2">{item.title}</h3>
              <p className="text-gray-300">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
