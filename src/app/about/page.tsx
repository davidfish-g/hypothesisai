'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center space-y-4"
      >
        <div className="relative w-200 h-170">
          <Image
            src="/obiwan.gif"
            alt="Obi-Wan Kenobi saying Hello there"
            fill
            className="object-contain"
            priority
          />
        </div>
      </motion.div>
    </div>
  );
} 