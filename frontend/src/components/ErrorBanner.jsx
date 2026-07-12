import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

export default function ErrorBanner({ errorMsg }) {
  if (!errorMsg) return null;

  return (
    <motion.div 
      className="bg-rose-500/15 border border-rose-500/20 p-5 rounded-2xl flex items-start space-x-3 text-sm text-rose-300"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
      <div>
        <h4 className="font-bold text-white mb-1">Debate Graph Error</h4>
        <p>{errorMsg}</p>
      </div>
    </motion.div>
  );
}
