'use client';

import { motion } from 'framer-motion';

export default function Profile() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div 
        className="text-center py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-200 mb-4">Profile</h1>
        <p className="text-xl text-gray-300">Work in Progress</p>
      </motion.div>
    </div>
  );
} 