import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export default function LoadingProgress({ loadingStep }) {
  return (
    <motion.div 
      className="glass-card p-12 rounded-3xl border border-white/5 min-h-[450px] flex flex-col justify-center items-center text-center space-y-8"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      key="loading"
    >
      <div className="relative">
        {/* Glowing outer rings */}
        <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl pulse-glow-bg"></div>
        <div className="bg-[#12131a] p-8 rounded-full border border-purple-500/20 relative flex items-center justify-center">
          <RefreshCw className="w-12 h-12 text-purple-400 animate-spin" />
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-white tracking-tight">Investment Committee Convening</h3>
        
        {/* Stepped progress indicators */}
        <div className="flex items-center justify-center space-x-4 max-w-md mx-auto pt-4">
          {[
            { id: 1, text: "ResearchAgent Aggregating", active: loadingStep >= 1 },
            { id: 2, text: "Parallel Thesis Fan-Out", active: loadingStep >= 2 },
            { id: 3, text: "JudgeAgent Verdict Decision", active: loadingStep >= 3 }
          ].map((ls) => (
            <div key={ls.id} className="flex flex-col items-center space-y-1.5">
              <div className={`h-2.5 w-2.5 rounded-full transition-all duration-500 ${
                ls.active ? 'bg-purple-400 shadow-md shadow-purple-500/50 scale-125' : 'bg-white/10'
              }`}></div>
              <span className={`text-[10px] font-bold tracking-wider uppercase transition-colors duration-500 ${
                ls.active ? 'text-purple-300' : 'text-gray-600'
              }`}>{ls.text}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 italic max-w-sm mx-auto pt-4">
          {loadingStep === 1 && "Connecting to Tavily REST Search & Alpha Vantage Fundamentals to fetch financial statements and news..."}
          {loadingStep === 2 && "Splitting state graph to evaluate independent, diverging bull arguments, bear arguments, and risk audit files in parallel..."}
          {loadingStep === 3 && "JudgeAgent consolidation node is reviewing debate transcripts against user risk mandates to compute verdict JSON..."}
        </p>
      </div>
    </motion.div>
  );
}
