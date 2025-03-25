'use client';

import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xl text-gray-300">Hello there</p>
      </motion.div>
    </div>
  );
} 