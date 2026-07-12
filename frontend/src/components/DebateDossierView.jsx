import React from 'react';
import { 
  BookOpen, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight, 
  ShieldAlert, 
  AlertTriangle 
} from 'lucide-react';
import VerdictCard from './VerdictCard';

export default function DebateDossierView({ resultData }) {
  if (!resultData) return null;

  return (
    <>
      {/* Research dossier (Facts Only) */}
      <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-white/5 pb-3">
          <BookOpen className="w-4.5 h-4.5 text-purple-400" />
          <span>ResearchAgent Dossier (Facts Only)</span>
        </h4>
        
        {/* Financial stats if loaded */}
        {resultData.dossier?.keyMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4">
            {[
              { label: 'Market Cap', val: resultData.dossier.keyMetrics.marketCap },
              { label: 'P/E Ratio', val: resultData.dossier.keyMetrics.peRatio },
              { label: 'EPS', val: resultData.dossier.keyMetrics.eps },
              { label: 'Profit Margin', val: resultData.dossier.keyMetrics.profitMargin }
            ].map((m, i) => (
              <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-500 block mb-0.5">{m.label}</span>
                <span className="text-sm font-black text-white">{m.val || 'N/A'}</span>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <p className="text-sm text-gray-300 leading-relaxed font-medium">
            {resultData.dossier?.businessOverview || 'No core overview compiled.'}
          </p>
          
          <div className="space-y-2 pt-2">
            <span className="text-xs uppercase text-purple-400 font-bold tracking-wider">Extracted News Realities</span>
            <ul className="space-y-2">
              {resultData.dossier?.recentNews?.map((news, idx) => (
                <li key={idx} className="text-xs text-gray-300 bg-[#12131a] p-3 rounded-lg border border-white/5">
                  <span className="font-extrabold text-white block mb-1">{news.title}</span>
                  <span className="italic">"{news.summary}"</span>
                </li>
              )) || <li className="text-xs text-gray-500">No news files extracted.</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* Divergent Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bull Case */}
        <div className="glass-card p-6 rounded-2xl border border-emerald-500/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="font-bold text-emerald-400 flex items-center space-x-2 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>BullAgent Thesis (FOR)</span>
            </span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed italic">"{resultData.bullCase?.thesis || 'No positive thesis established.'}"</p>
          <div className="space-y-2 pt-2">
            <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Primary Catalysts</span>
            {resultData.bullCase?.keyCatalysts?.map((p, i) => (
              <div key={i} className="flex items-center space-x-2 text-xs text-gray-300 bg-white/5 p-2.5 rounded-lg border border-white/5">
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{p}</span>
              </div>
            )) || <p className="text-xs text-gray-500">None flagged.</p>}
          </div>
        </div>

        {/* Bear Case */}
        <div className="glass-card p-6 rounded-2xl border border-rose-500/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <span className="font-bold text-rose-400 flex items-center space-x-2 text-sm">
              <TrendingDown className="w-4 h-4" />
              <span>BearAgent Thesis (AGAINST)</span>
            </span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed italic">"{resultData.bearCase?.thesis || 'No negative thesis established.'}"</p>
          <div className="space-y-2 pt-2">
            <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Primary Concerns</span>
            {resultData.bearCase?.keyRisks?.map((p, i) => (
              <div key={i} className="flex items-center space-x-2 text-xs text-gray-300 bg-white/5 p-2.5 rounded-lg border border-white/5">
                <ChevronRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{p}</span>
              </div>
            )) || <p className="text-xs text-gray-500">None flagged.</p>}
          </div>
        </div>
      </div>

      {/* Risks & Judge Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Audit */}
        <div className="glass-card p-6 rounded-2xl border border-amber-500/10 space-y-4">
          <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2 border-b border-white/5 pb-3">
            <ShieldAlert className="w-4.5 h-4.5" />
            <span>RiskAgent Audit Flags</span>
          </h4>
          <ul className="space-y-3">
            {resultData.riskFlags?.riskFlags?.map((flag, idx) => (
              <li key={idx} className="flex items-start space-x-2.5 text-xs text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5">
                <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                  flag.severity === 'High' ? 'text-rose-500' :
                  flag.severity === 'Medium' ? 'text-amber-500' : 'text-blue-400'
                }`} />
                <div>
                  <span className="font-extrabold text-white block mb-0.5">{flag.type} ({flag.severity} Severity)</span>
                  <span className="leading-relaxed">{flag.description}</span>
                </div>
              </li>
            )) || <li className="text-xs text-gray-500">No flags audited.</li>}
          </ul>
        </div>

        {/* Judge consolidation */}
        <VerdictCard resultData={resultData} variant="deliberation" />
      </div>
    </>
  );
}
