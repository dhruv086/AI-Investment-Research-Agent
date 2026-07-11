import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Scale, 
  Search, 
  Cpu, 
  Layers, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  RefreshCw, 
  Play, 
  Sparkles, 
  Database,
  ArrowRight,
  ChevronRight,
  BookOpen,
  History,
  X,
  Menu,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  // Input states
  const [company, setCompany] = useState('');
  const [riskProfile, setRiskProfile] = useState('Balanced');
  
  // App execution states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1); // 1: Research, 2: Parallel Agents, 3: Judge
  const [step, setStep] = useState(0); // 0: Idle, 1: Running, 4: Complete
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Data states
  const [resultData, setResultData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [dbStatus, setDbStatus] = useState('Checking'); // 'Online' | 'Offline'
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch session history list on load
  const fetchSessions = async () => {
    try {
      const response = await fetch(`${API_BASE}/sessions`);
      if (response.status === 503) {
        setDbStatus('Offline');
        setSessions([]);
        return;
      }
      if (!response.ok) throw new Error('Failed to load past sessions');
      const data = await response.json();
      setSessions(data);
      setDbStatus('Online');
    } catch (err) {
      console.warn("MongoDB is offline or disconnected:", err.message);
      setDbStatus('Offline');
      setSessions([]);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Run the debate graph
  const triggerDebate = async (e) => {
    e.preventDefault();
    if (!company) return;

    setIsLoading(true);
    setErrorMsg(null);
    setResultData(null);
    setStep(1);
    setLoadingStep(1);

    // Simulate loading steps visually since the backend API is a single HTTP request
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < 3) return prev + 1;
        return prev;
      });
    }, 3500);

    try {
      const response = await fetch(`${API_BASE}/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: company, riskProfile })
      });

      clearInterval(stepInterval);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete committee debate');
      }

      setResultData(data);
      setSelectedSessionId(data.sessionId);
      setStep(4); // Complete
      setIsLoading(false);

      // Trigger confetti on positive catalyst
      if (data.verdict === 'Invest') {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#c084fc', '#6366f1', '#10b981']
        });
      }

      // Refresh list
      fetchSessions();
    } catch (err) {
      clearInterval(stepInterval);
      console.error(err);
      setErrorMsg(err.message);
      setStep(0);
      setIsLoading(false);
    }
  };

  // Reopen a session from history
  const loadPastSession = async (id) => {
    setIsLoading(true);
    setErrorMsg(null);
    setResultData(null);
    setStep(1);
    setLoadingStep(3); // Direct load
    setSelectedSessionId(id);

    try {
      const response = await fetch(`${API_BASE}/sessions/${id}`);
      if (!response.ok) {
        throw new Error('Failed to retrieve past session details');
      }
      const data = await response.json();
      setResultData(data);
      setStep(4);
      setIsLoading(false);

      if (data.verdict === 'Invest') {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#c084fc', '#6366f1', '#10b981']
        });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
      setStep(0);
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCompany('');
    setResultData(null);
    setSelectedSessionId(null);
    setStep(0);
  };

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
            <motion.aside 
              className="w-80 border-r border-white/5 bg-[#0e0f14]/80 backdrop-blur-md p-5 flex flex-col z-40"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                <span className="font-bold text-white uppercase text-xs tracking-wider flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>Committee Archive</span>
                </span>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sessions List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {sessions.length === 0 ? (
                  <div className="text-center py-8 text-xs text-gray-500 space-y-2">
                    <Database className="w-8 h-8 mx-auto text-gray-600 stroke-1" />
                    <p>{dbStatus === 'Offline' ? 'Database unavailable.' : 'No archives found. Conduct a debate to save history.'}</p>
                  </div>
                ) : (
                  sessions.map((item) => {
                    const isSelected = selectedSessionId === item._id;
                    const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    });
                    
                    return (
                      <button
                        key={item._id}
                        onClick={() => loadPastSession(item._id)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all duration-300 ${
                          isSelected 
                            ? 'bg-purple-600/10 border-purple-500/40 shadow-md shadow-purple-500/5' 
                            : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-extrabold text-white text-sm">{item.companyName}</span>
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                            item.verdict === 'Invest' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20' :
                            item.verdict === 'Watch' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/20' :
                            'bg-rose-600/20 text-rose-400 border border-rose-500/20'
                          }`}>
                            {item.verdict}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-gray-400">
                          <span>{item.riskProfile} Profile</span>
                          <span>{dateStr}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto px-8 py-10">
          <div className="max-w-5xl mx-auto space-y-10">

            {/* Error Message Box */}
            {errorMsg && (
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
            )}

            {/* Loading / Processing Interface */}
            <AnimatePresence mode="wait">
              {step === 1 && (
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
              )}

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
                    <form onSubmit={triggerDebate} className="glass-card p-6 rounded-2xl border border-white/5 space-y-6">
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

                  {/* Research dossier (Facts) */}
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
                  </div>

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
