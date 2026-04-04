'use client';

import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-200 mb-4">About HypothesisAI</h1>
        <p className="text-gray-300 leading-relaxed">
          HypothesisAI is a platform for evaluating how well AI models generate scientific hypotheses.
          Multiple AI models from different providers generate hypotheses across scientific domains, and
          domain experts rate them on novelty, plausibility, and testability. The results feed into a
          leaderboard that ranks models by their average expert ratings.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold text-gray-200">How It Works</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          <li>Sign in with your Google account</li>
          <li>Pick a scientific domain you have expertise in</li>
          <li>Read an AI-generated hypothesis and rate it on three criteria (1-5 scale)</li>
          <li>Your ratings are aggregated with other experts to rank the AI models</li>
        </ol>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold text-gray-200">Rating Criteria</h2>
        <div className="space-y-3 text-gray-300">
          <div>
            <span className="font-medium text-gray-200">Novelty</span> &mdash; How original is the hypothesis compared to existing theories?
          </div>
          <div>
            <span className="font-medium text-gray-200">Plausibility</span> &mdash; How well-supported is it by existing scientific knowledge?
          </div>
          <div>
            <span className="font-medium text-gray-200">Testability</span> &mdash; How feasible is it to validate through experiments?
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-3 pt-4"
      >
        <h2 className="text-xl font-semibold text-gray-200">Contact</h2>
        <p className="text-gray-300">
          Questions or feedback? Reach out at{' '}
          <a href="mailto:davidfish3@gmail.com" className="text-blue-400 hover:text-blue-300">
            davidfish3@gmail.com
          </a>
        </p>
        <p className="text-gray-300">
          View the source code on{' '}
          <a href="https://github.com/davidfish-g/hypothesisai" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
            GitHub
          </a>
        </p>
      </motion.div>
    </div>
  );
}
