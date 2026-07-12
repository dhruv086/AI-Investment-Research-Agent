import React from 'react';
import { Sparkles, Scale } from 'lucide-react';

export default function VerdictCard({ resultData, variant }) {
  if (!resultData) return null;

  if (variant === 'banner') {
    return (
      <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div>
          <div className="flex items-center space-x-2 text-xs text-purple-400 uppercase tracking-wider font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Presiding Verdict Decisions</span>
          </div>
          <h2 className="text-3xl font-black text-white">{resultData.companyName || resultData.company}</h2>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">{resultData.dossier?.sector || 'Industrial Sector'}</p>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Confidence</div>
            <div className="text-2xl font-extrabold text-indigo-300">{resultData.confidence}%</div>
          </div>

          <div className="h-12 w-px bg-white/10"></div>

          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Verdict</div>
            <div className={`text-3xl font-black px-6 py-2 rounded-xl text-center shadow-lg uppercase tracking-wide ${
              resultData.verdict === 'Invest' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10' :
              resultData.verdict === 'Watch' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30 shadow-amber-500/10' :
              'bg-rose-600/20 text-rose-400 border border-rose-500/30 shadow-rose-500/10'
            }`}>
              {resultData.verdict}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'deliberation') {
    return (
      <div className="glass-card p-6 rounded-2xl border border-indigo-500/20 bg-indigo-950/5 space-y-4">
        <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-2 border-b border-white/5 pb-3">
          <Scale className="w-4.5 h-4.5" />
          <span>presiding Judge deliberation</span>
        </h4>
        <p className="text-sm text-gray-200 leading-relaxed font-semibold bg-white/5 p-4 rounded-xl border border-white/5">
          {resultData.reasoning || resultData.judge?.reasoning || 'No details deliberated.'}
        </p>
        
        <div className="space-y-2 pt-2">
          <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Primary Verdict Factors</span>
          <div className="flex flex-wrap gap-2">
            {(resultData.keyFactors || resultData.judge?.keyFactors)?.map((factor, idx) => (
              <span key={idx} className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold">
                {factor}
              </span>
            )) || <span className="text-xs text-gray-500">None defined.</span>}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
