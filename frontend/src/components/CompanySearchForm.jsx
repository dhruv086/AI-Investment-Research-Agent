import React from 'react';
import { Search, Play } from 'lucide-react';

export default function CompanySearchForm({
  company,
  setCompany,
  riskProfile,
  setRiskProfile,
  onSubmit,
  isLoading
}) {
  return (
    <form onSubmit={onSubmit} className="glass-card p-6 rounded-2xl border border-white/5 space-y-6">
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-gray-400 font-bold">Company Name or Stock Ticker</label>
        <div className="relative">
          <input 
            type="text" 
            placeholder="e.g. NVIDIA, AAPL, Tesla, Microsoft" 
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            disabled={isLoading}
            className="w-full bg-[#12131a] border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
            required
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-gray-400 font-bold">Committee Risk Mandate</label>
        <div className="grid grid-cols-3 gap-2 bg-[#12131a] p-1.5 rounded-xl border border-white/10">
          {['Conservative', 'Balanced', 'Aggressive'].map((mode) => {
            const isActive = riskProfile === mode;
            return (
              <button
                type="button"
                key={mode}
                onClick={() => setRiskProfile(mode)}
                disabled={isLoading}
                className={`relative py-3 rounded-lg text-xs font-bold tracking-wide transition-all duration-300 cursor-pointer ${
                  isActive 
                    ? 'bg-purple-600/25 text-purple-300 border border-purple-500/35 shadow-inner' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {mode}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !company}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-purple-500/25 flex items-center justify-center space-x-2 transition-all duration-300 cursor-pointer hover:scale-[1.01] active:scale-[0.99] btn-glow"
      >
        <Play className="w-5 h-5 fill-white text-white" />
        <span>Launch Committee Debate</span>
      </button>
    </form>
  );
}
