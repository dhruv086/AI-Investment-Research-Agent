import React from 'react';
import { Scale, History, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import useDebate from './hooks/useDebate';
import CompanySearchForm from './components/CompanySearchForm';
import LoadingProgress from './components/LoadingProgress';
import VerdictCard from './components/VerdictCard';
import DebateDossierView from './components/DebateDossierView';
import SessionSidebar from './components/SessionSidebar';
import ErrorBanner from './components/ErrorBanner';

export default function App() {
  const {
    company,
    setCompany,
    riskProfile,
    setRiskProfile,
    isLoading,
    loadingStep,
    step,
    errorMsg,
    resultData,
    sessions,
    dbStatus,
    selectedSessionId,
    sidebarOpen,
    setSidebarOpen,
    triggerDebate,
    loadPastSession,
    resetForm
  } = useDebate();

  return (
    <div className="relative min-h-screen bg-[#0b0c10] bg-grid-pattern text-gray-200 flex flex-col font-sans">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[120px] pulse-glow-bg pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-[150px] pulse-glow-bg pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass-card px-6 py-4 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-purple-500 to-indigo-600 p-2 rounded-lg shadow-lg shadow-purple-500/20">
            <Scale className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white">EQUILI<span className="text-purple-400">BRIUM</span></span>
            <span className="ml-2 text-xs uppercase bg-white/10 px-2 py-0.5 rounded-full text-purple-300 font-semibold tracking-wider">AI COMMITTEES</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center space-x-1.5 text-xs text-gray-300 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 transition-all duration-200"
          >
            <History className="w-4 h-4 text-purple-400" />
            <span>History</span>
          </button>
          
          <div className="flex items-center space-x-2 text-xs text-gray-400 bg-[#12131a] px-3 py-1.5 rounded-full border border-white/5">
            <span className={`h-2.5 w-2.5 rounded-full ${dbStatus === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`}></span>
            <span className="font-medium">DB Status: {dbStatus}</span>
          </div>
        </div>
      </header>

      {/* DB Offline Graceful Degradation Warning Banner */}
      {dbStatus === 'Offline' && (
        <div className="bg-amber-500/15 border-b border-amber-500/20 px-6 py-2.5 text-center text-xs text-amber-300 font-medium flex items-center justify-center space-x-2">
          <AlertTriangle className="w-4 h-4" />
          <span>MongoDB is currently offline. You can still run the AI debate graph, but history will not be saved locally.</span>
        </div>
      )}

      {/* Main Workspace Grid */}
      <div className="flex flex-1 relative overflow-hidden">
        
        {/* Left Sidebar: Past Debate Sessions */}
        <AnimatePresence>
          {sidebarOpen && (
            <SessionSidebar
              sessions={sessions}
              dbStatus={dbStatus}
              selectedSessionId={selectedSessionId}
              onLoadSession={loadPastSession}
              onClose={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto px-8 py-10">
          <div className="max-w-5xl mx-auto space-y-10">

            {/* Error Message Box */}
            <ErrorBanner errorMsg={errorMsg} />

            {/* Loading / Processing Interface */}
            <AnimatePresence mode="wait">
              {step === 1 && <LoadingProgress loadingStep={loadingStep} />}

              {/* Idle Configurator view */}
              {step === 0 && (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key="form"
                >
                  <div className="md:col-span-8 space-y-6">
                    <div className="text-left space-y-3">
                      <span className="text-xs uppercase bg-purple-500/10 px-3 py-1 rounded-full text-purple-300 font-extrabold border border-purple-500/10 tracking-widest">
                        Decision Engine
                      </span>
                      <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                        Weigh stocks with <span className="text-gradient-purple-blue">Multi-Agent Debates</span>
                      </h1>
                      <p className="text-gray-400 max-w-xl text-sm md:text-base leading-relaxed">
                        Input a target symbol and risk mandate. Our system triggers a diverging multi-agent state graph that analyzes headlines and fundamentals to determine an objective verdict.
                      </p>
                    </div>

                    {/* Inputs Card */}
                    <CompanySearchForm
                      company={company}
                      setCompany={setCompany}
                      riskProfile={riskProfile}
                      setRiskProfile={setRiskProfile}
                      onSubmit={triggerDebate}
                      isLoading={isLoading}
                    />
                  </div>

                  <div className="md:col-span-4 space-y-6">
                    {/* Side Info */}
                    <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                      <h3 className="font-bold text-white uppercase tracking-wider text-purple-400 text-xs">Graph Pipeline Topology</h3>
                      <div className="space-y-3 text-xs leading-relaxed">
                        <div className="flex items-start space-x-2.5">
                          <div className="bg-purple-500/20 text-purple-300 font-bold rounded-md px-1.5 py-0.5 mt-0.5">1</div>
                          <p><strong className="text-white">Research Node:</strong> Resolves ticker, pulls Tavily news searches and Alpha Vantage metrics in parallel.</p>
                        </div>
                        <div className="flex items-start space-x-2.5">
                          <div className="bg-emerald-500/20 text-emerald-300 font-bold rounded-md px-1.5 py-0.5 mt-0.5">2</div>
                          <p><strong className="text-white">Divergence Node:</strong> Fan-out execution of Bull and Bear agents without cross-observation constraints.</p>
                        </div>
                        <div className="flex items-start space-x-2.5">
                          <div className="bg-amber-500/20 text-amber-300 font-bold rounded-md px-1.5 py-0.5 mt-0.5">3</div>
                          <p><strong className="text-white">Audit Node:</strong> Audit Agent extracts negative catalysts and classifies hazard flags.</p>
                        </div>
                        <div className="flex items-start space-x-2.5">
                          <div className="bg-indigo-500/20 text-indigo-300 font-bold rounded-md px-1.5 py-0.5 mt-0.5">4</div>
                          <p><strong className="text-white">Consolidation Node:</strong> Judge Agent resolves debate relative to the input profile.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Debate results display */}
              {step === 4 && resultData && (
                <motion.div 
                  className="space-y-6 text-left"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  key="results"
                >
                  
                  {/* Verdict Banner Card */}
                  <VerdictCard resultData={resultData} variant="banner" />

                  {/* Research dossier, divergent cases, risks audit, and judge panel */}
                  <DebateDossierView resultData={resultData} />

                  <div className="text-center pt-4">
                    <button 
                      onClick={resetForm}
                      className="px-6 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-purple-500 hover:bg-white/5 transition-all duration-300 text-sm cursor-pointer"
                    >
                      Conduct Another Committee Debate
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Footer / Meta details */}
      <footer className="px-6 py-6 border-t border-white/5 text-center text-xs text-gray-600 bg-[#07080b]">
        <p>© 2026 Equilibrium AI Committee. Powered by LangGraph.js, Groq Llama-3.3-70b-versatile, and Tavily API.</p>
      </footer>
    </div>
  );
}
