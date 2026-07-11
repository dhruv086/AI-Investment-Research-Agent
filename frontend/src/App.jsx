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
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const MOCK_DOSSIERS = {
  "NVDA": {
    company: "NVIDIA Corporation (NVDA)",
    sector: "Semiconductors / AI Hardware",
    facts: [
      "Dominates ~90% of the datacenter AI chip market with Hopper & Blackwell architectures.",
      "FY2025 revenue surged 265% year-over-year driven by hyperscaler AI CAPEX.",
      "Gross margin is exceptionally high at 75-78%, reflecting deep pricing power.",
      "Alpha Vantage basic data: P/E Ratio ~65, PEG Ratio ~1.2, Net Income Margin 53%."
    ],
    bull: {
      case: "NVIDIA represents the bedrock of the generative AI revolution. Datacenter demand shows zero signs of saturation as hyperscalers build cluster nodes. Blackwell is sold out for the next 12 months, cementing their revenue stream. Software moat (CUDA platform) makes switching costs prohibitive for developers.",
      points: ["Blackwell chip cycle dominance", "Unbeatable software ecosystem (CUDA)", "Exceptional free cash flow conversion"]
    },
    bear: {
      case: "Valuation is priced for perfection. Any deceleration in capital expenditure from tech giants (Microsoft, AWS, Meta) would trigger a severe contraction. Escalating chip wars from custom ASIC chips (Google TPU, Amazon Trainium) and AMD hardware pose long-term threat. Taiwan geopolitics represents a critical manufacturing risk.",
      points: ["Valuation and forward expectations risk", "In-house custom silicon competition", "Geopolitical single-point of failure"]
    },
    risk: {
      flags: [
        "Highly concentrated customer base (top 4 hyperscalers represent 40%+ of sales).",
        "Geopolitical exposure: 100% of advanced node wafers fabricated at TSMC in Taiwan.",
        "High stock beta (2.1), indicating extreme price volatility compared to general market."
      ]
    },
    judge: {
      verdict: "Invest",
      confidence: 88,
      reasoning: "The sheer momentum, unbeatable gross margins, and CUDA developer locking effect outweigh the high valuation. Blackwell supply constraints guarantee near-term backlog execution. Recommend entry with a partial position on dips.",
      keyFactors: ["CUDA Software lock-in", "Blackwell order backlog", "Sustained high margins"]
    }
  },
  "AAPL": {
    company: "Apple Inc. (AAPL)",
    sector: "Consumer Electronics / Services",
    facts: [
      "Active installed base of devices exceeds 2.2 billion globally.",
      "Services division (App Store, iCloud, Music) now represents ~25% of total revenue and has a 70%+ gross margin.",
      "Cash and cash equivalents of over $150B, enabling immense stock buybacks.",
      "Alpha Vantage basic data: P/E Ratio ~31, Operating Margin ~30%, Dividend Yield 0.45%."
    ],
    bull: {
      case: "Unparalleled ecosystem lock-in keeps hardware replacement cycles steady. The roll-out of Apple Intelligence creates a strong multi-year upgrade cycle for iPhones. High-margin services revenue continues to expand faster than hardware, boosting long-term profitability metrics.",
      points: ["Apple Intelligence upgrade cycle", "High-margin services expansion", "Massive capital return program"]
    },
    bear: {
      case: "Hardware growth has matured and flattened globally. Regulatory antitrust actions in the US and Europe threaten high-margin App Store commissions and default search search-fees. Valuation of 31x earnings is historically high for a company growing revenue in the single-digits.",
      points: ["Global antitrust and regulatory headwinds", "Slow hardware revenue growth", "Premium multiple compression risk"]
    },
    risk: {
      flags: [
        "Regulatory suits from US Dept of Justice and EU Commission targeting closed ecosystem.",
        "Heavy reliance on China for manufacturing supply chain and consumer demand growth.",
        "Slower innovation rate compared to pure-play AI software giants."
      ]
    },
    judge: {
      verdict: "Watch",
      confidence: 72,
      reasoning: "Apple is a rock-solid safe haven, but the high multiple (31x) combined with systemic antitrust regulatory risks limit massive short-term upside. A 'Watch' verdict is appropriate while observing Apple Intelligence conversion rates.",
      keyFactors: ["Regulatory commission exposure", "iPhone 16 upgrade momentum", "Services growth durability"]
    }
  },
  "TSLA": {
    company: "Tesla, Inc. (TSLA)",
    sector: "Automotive / AI & Robotics",
    facts: [
      "World's leading EV seller, but facing severe margin compression due to price wars.",
      "Direct exposure to Full Self-Driving (FSD) beta and Optimus robotics pipeline.",
      "Zero net debt, with over $28B in liquidity to fund gigafactory expansions.",
      "Alpha Vantage basic data: P/E Ratio ~90, Gross Margin ~17%, Net Income Margin ~11%."
    ],
    bull: {
      case: "Tesla is not an automotive stock; it is an AI and robotics play. FSD licensing, Robotaxi networks, and Optimus humanoid robots represent trillion-dollar option values. Energy storage deployment is expanding exponentially, growing 100%+ year-over-year.",
      points: ["Autonomous Robotaxi optionality", "Energy Storage high-growth vertical", "Optimus AI humanoid pipeline"]
    },
    bear: {
      case: "Automobile sales gross margins have degraded from 30% to 17% due to global EV oversupply and pricing pressures from BYD and others. Tesla's valuation depends entirely on autonomous technology that is perpetually delayed. Governance risks around key leadership attention remain high.",
      points: ["Core auto margin compression", "Unproven Robotaxi commercial timelines", "Fierce Chinese EV competition"]
    },
    risk: {
      flags: [
        "Highly cyclical consumer product exposure subject to interest rate sensitivities.",
        "FSD regulatory approvals are highly uncertain and subject to NHTSA scrutiny.",
        "Key person risk regarding Elon Musk's split attention across ventures."
      ]
    },
    judge: {
      verdict: "Pass",
      confidence: 65,
      reasoning: "The current valuation is highly speculative and pricing in robotaxis that are not yet commercially viable or approved. EV margins are under structural pressure. Suggest passing or delaying entry until margins stabilize.",
      keyFactors: ["EV margin deterioration", "Regulatory autonomous delay", "Speculative robotaxi multiples"]
    }
  }
};

export default function App() {
  const [company, setCompany] = useState('');
  const [riskProfile, setRiskProfile] = useState('Balanced');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0); // 0: Idle, 1: Research, 2: Bull/Bear/Risk, 3: Judge, 4: Complete
  const [resultData, setResultData] = useState(null);
  const [backendStatus, setBackendStatus] = useState('Connected');

  useEffect(() => {
    // Ping mock backend health endpoint just to show architecture readiness
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => {
        console.log("Backend connection healthy:", data);
        setBackendStatus('Connected');
      })
      .catch(err => {
        console.warn("Backend not running yet, using local simulator mode.");
        setBackendStatus('Local Sim Ready');
      });
  }, []);

  const triggerDebate = async (e) => {
    e.preventDefault();
    if (!company) return;

    setIsLoading(true);
    setResultData(null);
    
    // Simulate agent steps
    setStep(1); // Researching
    await new Promise(r => setTimeout(r, 2000));
    
    setStep(2); // Bull/Bear/Risk parallel processing
    await new Promise(r => setTimeout(r, 2500));
    
    setStep(3); // Judge node debating
    await new Promise(r => setTimeout(r, 1800));
    
    // Resolve mock data or use fallback default if ticker is not in pre-defined list
    const ticker = company.toUpperCase().trim();
    const data = MOCK_DOSSIERS[ticker] || {
      company: `${company} (Generic Simulation)`,
      sector: "Technology / Miscellaneous",
      facts: [
        `Company ${company} was successfully catalogued by ResearchAgent.`,
        "Revenue lines show consistent baseline operations, though market reports are thin.",
        "Alpha Vantage basic statistics: Baseline industry average ratios applied.",
        "Recent news notes strategic investments into artificial intelligence pipelines."
      ],
      bull: {
        case: `The company has a highly adaptable business model. Under a ${riskProfile} risk mandate, there are significant expansion vectors into regional and digital markets with relatively low overhead.`,
        points: ["Scalable operating leverage", "Low legacy technology baggage", "Agile market pivot speed"]
      },
      bear: {
        case: `Market liquidity constraints pose a significant structural barrier. The lack of a deep intellectual property moat makes it vulnerable to displacement by larger hyper-scalers.`,
        points: ["Limited proprietary intellectual property", "Capital constraints", "Intense commoditization risk"]
      },
      risk: {
        flags: [
          "Information asymmetry due to early-stage disclosures.",
          "Potential liquidity and trading volume volatility.",
          "Execution risk during the transition into new product lines."
        ]
      },
      judge: {
        verdict: riskProfile === 'Conservative' ? 'Pass' : riskProfile === 'Aggressive' ? 'Invest' : 'Watch',
        confidence: 70,
        reasoning: `Based on a ${riskProfile} investment framework, the balance of risk and growth points towards a clear outcome. Adequate reserves support potential long-term watch status, but immediate capital allocation is reserved.`,
        keyFactors: ["Valuation risk buffer", "Sector volatility limits", "Competitive threat profiles"]
      }
    };

    setResultData(data);
    setStep(4); // Complete
    setIsLoading(false);

    if (data.judge.verdict === 'Invest') {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c084fc', '#6366f1', '#10b981']
      });
    }
  };

  const resetForm = () => {
    setCompany('');
    setResultData(null);
    setStep(0);
  };

  return (
    <div className="relative min-h-screen bg-[#0b0c10] bg-grid-pattern text-gray-200">
      
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/10 blur-[120px] pulse-glow-bg pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-[150px] pulse-glow-bg pointer-events-none"></div>

      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 glass-card px-6 py-4 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-purple-500 to-indigo-600 p-2 rounded-lg shadow-lg shadow-purple-500/20">
            <Scale className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white">BOARD<span className="text-purple-400">ROOM</span></span>
            <span className="ml-2 text-xs uppercase bg-white/10 px-2 py-0.5 rounded-full text-purple-300 font-semibold tracking-wider">AI AGENT</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <span className={`h-2.5 w-2.5 rounded-full ${backendStatus === 'Connected' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
            <span className="font-medium">{backendStatus}</span>
          </div>
          <a href="#about" className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center">
            <BookOpen className="w-4 h-4 mr-1" /> Docs
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Title Hero */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-extrabold tracking-tight text-white mb-4">
              AI Investment <span className="text-gradient-purple-blue">Committee Debate</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Simulate high-fidelity committee debates between independent AI agents specialized in 
              Bull case, Bear case, and Risk signals before arriving at a final verdict.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              className="glass-card p-6 rounded-2xl border border-white/5 space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-purple-400" />
                <span>Debate Configuration</span>
              </h2>

              <form onSubmit={triggerDebate} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Company Name or Ticker</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="e.g. NVDA, AAPL, TSLA" 
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-[#12131a] border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
                      required
                    />
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex gap-2 pt-1.5">
                    {["NVDA", "AAPL", "TSLA"].map(sym => (
                      <button 
                        type="button" 
                        key={sym} 
                        onClick={() => setCompany(sym)}
                        disabled={isLoading}
                        className="text-xs px-2.5 py-1 rounded bg-white/5 border border-white/5 hover:border-purple-500 hover:text-white transition-colors duration-200"
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Risk Mandate Profile</label>
                  <div className="grid grid-cols-3 gap-2 bg-[#12131a] p-1 rounded-xl border border-white/10">
                    {['Conservative', 'Balanced', 'Aggressive'].map((mode) => {
                      const isActive = riskProfile === mode;
                      return (
                        <button
                          type="button"
                          key={mode}
                          onClick={() => setRiskProfile(mode)}
                          disabled={isLoading}
                          className={`relative py-2.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                            isActive 
                              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
                              : 'text-gray-400 hover:text-white'
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
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-purple-500/20 flex items-center justify-center space-x-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] btn-glow cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Graph Executing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>Start Committee Debate</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* Architecture Card */}
            <motion.div 
              className="glass-card p-6 rounded-2xl border border-white/5 space-y-4 text-xs"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="font-bold text-white uppercase tracking-wider text-purple-400">LangGraph Debate Flow</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-300">
                  <div className="bg-white/5 p-1.5 rounded-md text-purple-400">1</div>
                  <span><strong>ResearchAgent</strong> aggregates recent news & financial data.</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <div className="bg-white/5 p-1.5 rounded-md text-emerald-400">2</div>
                  <span><strong>Bull & Bear Agents</strong> build independent arguments in parallel.</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <div className="bg-white/5 p-1.5 rounded-md text-amber-400">3</div>
                  <span><strong>RiskAgent</strong> audits red flags, debt, and industry headwinds.</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <div className="bg-white/5 p-1.5 rounded-md text-indigo-400">4</div>
                  <span><strong>JudgeAgent</strong> evaluates and renders structured JSON verdict.</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right panel: Simulation and results */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Step Indicators */}
            {step > 0 && (
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {[
                  { id: 1, label: 'Researching', active: step >= 1 },
                  { id: 2, label: 'Committee Review', active: step >= 2 },
                  { id: 3, label: 'Judge Debate', active: step >= 3 },
                  { id: 4, label: 'Verdict Rendered', active: step >= 4 },
                ].map((s, idx) => (
                  <div 
                    key={s.id} 
                    className={`py-2 border-b-2 font-bold transition-all duration-300 ${
                      s.active 
                        ? 'text-purple-400 border-purple-500' 
                        : 'text-gray-600 border-white/5'
                    }`}
                  >
                    {s.label}
                  </div>
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div 
                  className="glass-card p-12 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key="idle"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
                    <div className="bg-[#12131a] p-6 rounded-full border border-purple-500/20 text-purple-400">
                      <Sparkles className="w-12 h-12" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">Ready for Committee Instructions</h3>
                    <p className="text-gray-400 max-w-sm">
                      Select a company and submit to launch the LangGraph committee. Try NVDA, AAPL or TSLA to see customized committee insights.
                    </p>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div 
                  className="glass-card p-8 rounded-2xl border border-white/5 space-y-6 min-h-[400px] flex flex-col justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key="research"
                >
                  <div className="flex items-center space-x-3 text-purple-400 font-bold uppercase tracking-wider text-sm">
                    <Activity className="w-5 h-5 animate-pulse" />
                    <span>Research Node active</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Compiling Target dossier...</h3>
                  <div className="space-y-3">
                    <div className="h-4 bg-white/5 rounded-full w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-white/5 rounded-full w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-white/5 rounded-full w-2/3 animate-pulse"></div>
                    <div className="h-4 bg-white/5 rounded-full w-1/2 animate-pulse"></div>
                  </div>
                  <div className="text-xs text-gray-500 italic mt-6 flex items-center space-x-2">
                    <Database className="w-4 h-4 animate-spin text-purple-500" />
                    <span>Querying Tavily News & Alpha Vantage Fundamentals...</span>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  className="space-y-6 min-h-[400px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key="committee"
                >
                  <div className="flex items-center space-x-3 text-emerald-400 font-bold uppercase tracking-wider text-sm">
                    <Layers className="w-5 h-5 animate-bounce" />
                    <span>Committee Nodes Executing in Parallel</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-5 rounded-xl border border-emerald-500/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-400 text-sm">BullAgent</span>
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-emerald-500/20 rounded animate-pulse w-full"></div>
                        <div className="h-2 bg-emerald-500/20 rounded animate-pulse w-5/6"></div>
                        <div className="h-2 bg-emerald-500/20 rounded animate-pulse w-4/5"></div>
                      </div>
                      <p className="text-xs text-gray-500">Formulating positive catalyst thesis...</p>
                    </div>

                    <div className="glass-card p-5 rounded-xl border border-rose-500/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-400 text-sm">BearAgent</span>
                        <TrendingDown className="w-4 h-4 text-rose-400" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-rose-500/20 rounded animate-pulse w-full"></div>
                        <div className="h-2 bg-rose-500/20 rounded animate-pulse w-5/6"></div>
                        <div className="h-2 bg-rose-500/20 rounded animate-pulse w-4/5"></div>
                      </div>
                      <p className="text-xs text-gray-500">Auditing bear catalysts and structural flaws...</p>
                    </div>

                    <div className="glass-card p-5 rounded-xl border border-amber-500/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-400 text-sm">RiskAgent</span>
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-amber-500/20 rounded animate-pulse w-full"></div>
                        <div className="h-2 bg-amber-500/20 rounded animate-pulse w-5/6"></div>
                        <div className="h-2 bg-amber-500/20 rounded animate-pulse w-4/5"></div>
                      </div>
                      <p className="text-xs text-gray-500">Flagging macro/micro risk parameters...</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  className="glass-card p-8 rounded-2xl border border-white/5 space-y-6 min-h-[400px] flex flex-col justify-center text-center items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key="judge"
                >
                  <div className="bg-indigo-600/20 p-4 rounded-full border border-indigo-500/30 text-indigo-400 animate-spin">
                    <Scale className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white">JudgeAgent Consolidating Arguments</h3>
                    <p className="text-gray-400 text-sm max-w-md">
                      Applying the requested "{riskProfile}" risk profile to debate results and generating structured verdict.
                    </p>
                  </div>
                </motion.div>
              )}

              {step === 4 && resultData && (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  key="result"
                >
                  {/* Verdict Badge Card */}
                  <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                      <div className="flex items-center space-x-2 text-xs text-purple-400 uppercase tracking-wider font-semibold mb-1">
                        <span>Research Dossier Verdict</span>
                      </div>
                      <h3 className="text-2xl font-black text-white">{resultData.company}</h3>
                      <p className="text-xs text-gray-500 font-medium">{resultData.sector}</p>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Confidence</div>
                        <div className="text-2xl font-extrabold text-indigo-300">{resultData.judge.confidence}%</div>
                      </div>

                      <div className="h-12 w-px bg-white/10"></div>

                      <div className="text-right">
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Verdict</div>
                        <div className={`text-3xl font-black px-6 py-2 rounded-xl text-center shadow-lg uppercase ${
                          resultData.judge.verdict === 'Invest' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10' :
                          resultData.judge.verdict === 'Watch' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30 shadow-amber-500/10' :
                          'bg-rose-600/20 text-rose-400 border border-rose-500/30 shadow-rose-500/10'
                        }`}>
                          {resultData.judge.verdict}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Research dossier Section */}
                  <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2 border-b border-white/5 pb-3">
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      <span>ResearchAgent Dossier (Facts Only)</span>
                    </h4>
                    <ul className="space-y-2.5 text-sm text-gray-300 list-disc list-inside pl-2">
                      {resultData.facts.map((fact, idx) => (
                        <li key={idx} className="leading-relaxed">{fact}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Debate Cases Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Bull Case */}
                    <div className="glass-card p-6 rounded-2xl border border-emerald-500/10 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <span className="font-bold text-emerald-400 flex items-center space-x-2 text-sm">
                          <TrendingUp className="w-4 h-4" />
                          <span>BullAgent Case (FOR)</span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed italic">"{resultData.bull.case}"</p>
                      <div className="space-y-2 pt-2">
                        <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider">Key Catalysts</span>
                        {resultData.bull.points.map((p, i) => (
                          <div key={i} className="flex items-center space-x-2 text-xs text-gray-300 bg-white/5 p-2 rounded-lg border border-white/5">
                            <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bear Case */}
                    <div className="glass-card p-6 rounded-2xl border border-rose-500/10 space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <span className="font-bold text-rose-400 flex items-center space-x-2 text-sm">
                          <TrendingDown className="w-4 h-4" />
                          <span>BearAgent Case (AGAINST)</span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed italic">"{resultData.bear.case}"</p>
                      <div className="space-y-2 pt-2">
                        <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider">Key Risks</span>
                        {resultData.bear.points.map((p, i) => (
                          <div key={i} className="flex items-center space-x-2 text-xs text-gray-300 bg-white/5 p-2 rounded-lg border border-white/5">
                            <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Risks & Judge Panel */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Risk Audit */}
                    <div className="glass-card p-6 rounded-2xl border border-amber-500/10 space-y-4">
                      <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2 border-b border-white/5 pb-3">
                        <ShieldAlert className="w-4 h-4" />
                        <span>RiskAgent Audit Flags</span>
                      </h4>
                      <ul className="space-y-3">
                        {resultData.risk.flags.map((flag, idx) => (
                          <li key={idx} className="flex items-start space-x-2.5 text-xs text-gray-300 bg-white/5 p-2.5 rounded-lg border border-white/5">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Judge Reasoning */}
                    <div className="glass-card p-6 rounded-2xl border border-indigo-500/20 bg-indigo-950/5 space-y-4">
                      <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-2 border-b border-white/5 pb-3">
                        <Scale className="w-4 h-4" />
                        <span>JudgeAgent Deliberation</span>
                      </h4>
                      <p className="text-sm text-gray-200 leading-relaxed font-medium">
                        {resultData.judge.reasoning}
                      </p>
                      
                      <div className="space-y-2 pt-2">
                        <span className="text-xs uppercase text-gray-500 font-semibold tracking-wider">Primary Verdict Factors</span>
                        <div className="flex flex-wrap gap-2">
                          {resultData.judge.keyFactors.map((factor, idx) => (
                            <span key={idx} className="text-xs px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold">
                              {factor}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-4">
                    <button 
                      onClick={resetForm}
                      className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-purple-500 transition-all duration-300 text-sm cursor-pointer"
                    >
                      Conduct Another Debate
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer / Info */}
      <footer id="about" className="max-w-7xl mx-auto px-6 py-12 mt-12 border-t border-white/5 text-center text-xs text-gray-500 space-y-4">
        <p>© 2026 Boardroom AI. Powered by LangGraph.js, Groq Llama-3.3-70b-versatile, and Tavily API.</p>
        <p className="max-w-2xl mx-auto leading-relaxed">
          Boardroom uses a state-graph topology to enforce divergence in analysis (Bull & Bear nodes running independently without mutual observation) before presenting structural points to a consolidation judge node parameterized with a user risk tolerance profile.
        </p>
      </footer>
    </div>
  );
}
