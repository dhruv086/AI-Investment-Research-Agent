# Equilibrium — AI Investment Research Committee

An AI investment research agent that takes a company name and a risk mandate, runs a simulated investment-committee debate between four specialized AI agents, and returns a final `Invest` / `Pass` / `Watch` verdict with a confidence score and reasoning.

**Live app:** https://equilibrium-ai-uhay.onrender.com/

> Note: the live link is hosted on Render's free tier. If it's been idle, the **first request can take 30–60 seconds** while the instance spins back up — this is a hosting-tier limitation, not a bug.

---

## 1. Overview

Instead of asking a single LLM "should I invest in X?" and getting one opinion back, Equilibrium simulates an actual investment committee:

1. A **Research Agent** gathers facts on the company (news + fundamentals) and compiles them into a structured, opinion-free dossier.
2. Three agents read that *same* dossier independently and in parallel:
   - a **Bull Agent** builds the strongest case *for* investing,
   - a **Bear Agent** builds the strongest case *against* it,
   - a **Risk Agent** audits the dossier for concrete red flags (leverage, valuation, concentration, regulatory).
3. A **Judge Agent** weighs all three arguments against the user's chosen risk mandate (Conservative / Balanced / Aggressive) and renders a final verdict, a confidence score, a written rationale, and the key factors that drove the decision.

The result is saved to MongoDB and shown in a dashboard, with a history sidebar of past runs.

---

## 2. How to run it

### Prerequisites
- Node.js v18+
- A MongoDB connection string (local or Atlas)
- API keys: **Groq** (required, LLM), **Tavily** (required, news search), **Alpha Vantage** (optional, fundamentals — the app degrades gracefully without it)

### Setup

```bash
git clone https://github.com/dhruv086/AI-Investment-Research-Agent.git
cd AI-Investment-Research-Agent
npm run install:all
```

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/equilibrium
GROQ_API_KEY=gsk_your_key_here
TAVILY_API_KEY=tvly-your_key_here
ALPHA_VANTAGE_API_KEY=your_key_here   # optional
```

### Run in development

```bash
# terminal 1
cd backend && npm run dev      # http://localhost:5000

# terminal 2
cd frontend && npm run dev     # http://localhost:5173
```

### Run in production (single process, as deployed on Render)

```bash
npm run build   # installs deps + builds the frontend into frontend/dist
npm start        # Express serves the API AND the built frontend on one port
```

### API endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/research` | Runs the full committee debate for `{ companyName, riskProfile }` and persists it |
| `GET` | `/api/sessions` | Lists past debate sessions (summary) |
| `GET` | `/api/sessions/:id` | Full detail of one past session |
| `GET` | `/api/health` | Health check |

---

## 3. How it works — architecture

```
User Input: Company + Risk Mandate
            │
            ▼
      ResearchAgent  ──uses──▶  Tavily (news search) + Alpha Vantage (fundamentals)
            │
            ▼
   Factual Dossier (structured, Zod-validated, opinion-free)
            │
   ┌────────┼────────┐
   ▼        ▼        ▼
BullAgent BearAgent RiskAgent      ← run in parallel, each sees ONLY the dossier
   │        │        │               (never sees the other agents' output —
   └────────┼────────┘                this is deliberate, to prevent anchoring/cross-bias)
            ▼
       JudgeAgent  ──weighs Bull case + Bear case + Risk flags against the
            │        selected Risk Mandate──▶
            ▼
   Verdict: Invest / Pass / Watch
   + Confidence (0–100)
   + Reasoning
   + Key Factors
            │
            ▼
      MongoDB (persisted session) + React dashboard
```

### Orchestration
The graph is built with **LangGraph.js** using a `StateGraph` with explicit fan-out/fan-in edges:

```
__start__ → research → { bull, bear, risk } → judge → __end__
```

`research` runs once; `bull`, `bear`, and `risk` all trigger off it and run **concurrently**; `judge` only fires once all three have completed (LangGraph's built-in join/synchronization). This is a real parallel graph, not three sequential prompt calls dressed up as "agents."

### The dossier (facts-only layer)
The Research Agent resolves a company name to a ticker (via a fast, low-temperature LLM lookup, falling back to a generic profile for private companies), then fetches Tavily news and Alpha Vantage fundamentals **in parallel**, and feeds both into a low-temperature (0.1) LLM call constrained by a Zod schema (`dossier.schema.js`) covering financial/valuation metrics, deal/legal terms, market/growth terms (TAM/SAM/SOM/CAGR), and performance/return metrics (ROIC/WACC/IRR/MOIC). The system prompt explicitly forbids opinions or recommendations at this stage — the goal is to separate "what is true" from "what to think about it," so the debate agents argue over the same facts rather than re-deriving them differently.

### Bull / Bear / Risk agents
Each is a separate LLM call (temperature 0.7 for Bull/Bear to allow persuasive framing, 0.2 for Risk to keep it precise) against the *same* dossier, each with a Zod-structured output schema and a system prompt that explicitly forbids referencing the other agents' arguments. This isolation is the core design decision that makes the debate meaningful rather than one model agreeing with itself three times.

### Judge agent and the verdict
The Judge (temperature 0.2, for consistency) receives the Bull case, Bear case, Risk flags, and the user's risk mandate as JSON, and produces a structured verdict via a Zod schema:

```js
{
  verdict: "Invest" | "Pass" | "Watch",
  confidence: number (0-100),
  reasoning: string,
  keyFactors: string[]
}
```

**How the confidence percentage is produced — to be precise about this:** the confidence score is **not** computed by a deterministic formula in code. It is the Judge LLM's own self-assessed confidence in its verdict, constrained to a 0–100 numeric range by the output schema, generated *after* it has explicitly reasoned through the Bull case, Bear case, and Risk audit against the selected mandate. The system prompt requires the model to ground that reasoning in the specific metrics provided (ROIC vs. WACC, LTV/CAC, TAM/CAGR, liquidation preferences), so the number isn't arbitrary — but it is a language-model judgment call, not an arithmetic score. This is a legitimate and common pattern for LLM-based decision systems, but it's worth being upfront about rather than implying a formula exists.

### Persistence and degraded mode
Every completed debate is saved to MongoDB (`debateSession.model.js`). If Mongo isn't reachable, the API still returns the full result to the user — it just skips persistence and returns a "degraded mode" message rather than failing the request. The `/api/sessions` endpoints return a `503` if the DB is offline instead of crashing.

### Frontend
A single-page React (Vite) app: company/risk-mandate input, a staged loading indicator (Research → Parallel debate → Judge) so the user sees the pipeline progressing rather than a blank spinner, a verdict dashboard, and a sidebar of past sessions pulled from `/api/sessions`.

---

## 4. Key decisions & trade-offs

| Decision | Why | Trade-off |
|---|---|---|
| **Groq (Llama 3.3 70B) as the LLM provider** | Fast + free-tier-friendly, good enough structured-output reliability for this scope, lets the whole debate (5 sequential/parallel LLM calls) finish in a few seconds rather than 30+ | Not necessarily the strongest reasoning model available (e.g., GPT-4-class or Claude); a production version would likely benchmark verdict quality across providers |
| **Facts-only dossier, isolated Bull/Bear/Risk agents** | Prevents the debate from collapsing into one model agreeing with itself; makes the reasoning traceable back to specific facts | More LLM calls per run (5 total) → higher latency and cost than a single-shot prompt |
| **LLM-based ticker resolution instead of a symbol-lookup API/database** | Fast to build, works for well-known public companies out of the box | Can misresolve or hallucinate a ticker for smaller/private companies, silently degrading fundamentals quality — flagged as a known limitation |
| **Alpha Vantage marked optional, app degrades gracefully without it** | Free tier is heavily rate-limited (5 req/min, 25/day); didn't want a rate-limit hit to break the whole pipeline | Fundamentals section of the dossier can be thin/absent for some runs, more reliance on Tavily news |
| **Confidence as LLM self-assessment, not a weighted formula** | Simpler to build within the time box; still grounded by structured reasoning inputs | Less explainable/auditable than a rules-based scoring engine; noted above as the top thing I'd improve |
| **No auth / rate limiting on the API** | Out of scope for a single-user take-home demo | Not production-safe as-is; anyone with the URL can call `/api/research` and spend API credits |
| **Single monolithic `App.jsx` on the frontend** | Got a working, deployed UI within the time box | Not decomposed into components — the first thing I'd refactor with more time |
| **Deployed as one Express service serving the built React app** (rather than separate frontend/backend hosts) | Simpler single free-tier Render deployment, avoids CORS/env-var complexity across two hosts | Render free tier cold-starts and has no autoscaling |

---

## 5. Example runs

*(Replace the placeholders below with 2–3 actual runs from the live app before submitting — screenshot or paste the JSON response from `/api/research` for each.)*

### Example 1 — NVIDIA, Balanced mandate
- **Verdict:** _e.g. Invest_
- **Confidence:** _e.g. 78%_
- **Key factors:** _paste 3–5 from the actual run_
- **Reasoning (summary):** _paste 2–3 sentences from the actual `reasoning` field_

### Example 2 — [a smaller/private company], Conservative mandate
- **Verdict:**
- **Confidence:**
- **Key factors:**
- **Reasoning (summary):**

### Example 3 — [a company you expect a "Watch" or "Pass" result for], Aggressive mandate
- **Verdict:**
- **Confidence:**
- **Key factors:**
- **Reasoning (summary):**

---

## 6. What I would improve with more time

1. **Make the confidence score explainable, not just self-reported** — have Bull/Bear/Risk each emit a bounded strength/severity score, and derive the final confidence in code as a weighted function of those plus the risk mandate, rather than relying solely on the Judge's own number.
2. **Decompose the frontend** into proper components (`CompanySearchForm`, `VerdictCard`, `DebatePanel`, `SessionSidebar`) instead of one large `App.jsx`, and add basic loading/error states per section.
3. **Replace LLM-guessed ticker resolution** with a real symbol-lookup API (or a static exchange listing) and only fall back to the LLM for unlisted/private companies.
4. **Add caching** for repeated company lookups within a short window, to reduce Tavily/Alpha Vantage/Groq calls and cost.
5. **Add basic rate limiting and an API key/auth layer** before this could be exposed publicly beyond a demo.
6. **Add automated tests** around the graph nodes (mocking the LLM/tool calls) so agent-prompt changes don't silently break structured-output parsing.
7. **Benchmark verdict quality across LLM providers** (Groq/Llama vs. GPT vs. Claude vs. Gemini) since the JD's production stack includes several of these — worth knowing which gives the most reliable structured reasoning for this specific task.
8. **Surface tool degradation to the user** — right now if Alpha Vantage rate-limits or Tavily returns nothing, the run still completes silently on partial data; a small UI badge ("fundamentals unavailable for this run") would make that visible instead of hidden.

---

## 7. AI tools used while building this

As instructed by the assignment, AI was used throughout. Tools used: **Claude**, **ChatGPT**, **Kimi**, and **Antigravity** for planning, code generation, debugging, and architecture review, alongside **Groq** as the production LLM provider, **Tavily** for web search, and **Alpha Vantage** for financial fundamentals. Chat session transcripts/logs are included per the bonus-points instructions in `[transcripts folder/link — add path]`.
