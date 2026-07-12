# Equilibrium — AI Investment Research Committee

An AI investment research agent that takes a company name and a risk mandate, runs a simulated investment-committee debate between four specialized AI agents, and returns a final `Invest` / `Pass` / `Watch` verdict with a confidence score and reasoning.

**In one line:** this isn't a single-prompt "yes/no" bot — Bull, Bear, and Risk agents debate a shared factual dossier in parallel with no visibility into each other's arguments, and a Judge synthesizes a verdict whose confidence % is computed deterministically from their sub-scores, not just guessed.

**Live app:** https://equilibrium-ai-uhay.onrender.com/
**Repo:** https://github.com/dhruv086/AI-Investment-Research-Agent

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
The Judge (temperature 0.2, for consistency) receives the Bull case, Bear case, Risk flags, and the user's risk mandate as JSON. It produces the qualitative parts of the verdict via a Zod schema:

```js
{
  verdict: "Invest" | "Pass" | "Watch",
  reasoning: string,
  keyFactors: string[]
}
```

**How the confidence percentage is actually calculated:** the numeric confidence is **not** left to the LLM to self-report. Each debate agent first emits its own bounded sub-score as part of its structured output — `bullCase.strengthScore` (0–100, how strong the FOR case is), `bearCase.strengthScore` (0–100, how strong the AGAINST case is), and `riskFlags.severityScore` (0–100, aggregate severity of audited red flags). The Judge agent then computes the final confidence **in code**, deterministically, from those three sub-scores plus the user's risk mandate:

```js
const mandateWeights = { Conservative: 1.5, Balanced: 1.0, Aggressive: 0.5 };
const mandateWeight = mandateWeights[riskProfile];

const netStrength = bullStrength - bearStrength;
const riskPenalty  = riskSeverity * mandateWeight;

if (verdict === 'Invest') confidence = netStrength - riskPenalty;
else if (verdict === 'Pass') confidence = bearStrength - bullStrength + riskPenalty;
else /* Watch */ confidence = 100 - Math.abs(netStrength) - riskPenalty;

confidence = clamp(round(confidence), 0, 100);
```

So a Conservative mandate weighs risk severity 3x more heavily than an Aggressive one when penalizing confidence — which mirrors how the Judge's own verdict-level reasoning is instructed to behave (Conservative mandates are told to be "extremely sensitive to Risk Flags," Aggressive mandates are told to tolerate them). The verdict category itself (Invest/Pass/Watch) and the written reasoning still come from the LLM's holistic read of the debate — only the final percentage is a deterministic function of the three sub-scores, which makes it auditable: given the three inputs and the mandate, the confidence number can be recomputed and checked by hand rather than taken on faith.

### Persistence and degraded mode
Every completed debate is saved to MongoDB (`debateSession.model.js`). If Mongo isn't reachable, the API still returns the full result to the user — it just skips persistence and returns a "degraded mode" message rather than failing the request. The `/api/sessions` endpoints return a `503` if the DB is offline instead of crashing.

### Frontend
A React (Vite) single-page app, structured as components rather than one monolithic file:

```
frontend/src/
  hooks/useDebate.js         → all state + API calls (search, trigger debate, load session)
  components/
    CompanySearchForm.jsx    → company name input + risk mandate selector
    LoadingProgress.jsx      → staged loading indicator (Research → Parallel Agents → Judge)
    VerdictCard.jsx          → verdict / confidence / reasoning banner
    DebateDossierView.jsx    → dossier, bull/bear cases, and risk audit detail view
    SessionSidebar.jsx       → history of past debate sessions
    ErrorBanner.jsx          → error state display
  App.jsx                    → layout/composition only, wires the hook to the components
```

`App.jsx` composes the page and holds no business logic itself — all state and API calls live in the `useDebate` hook, and each visual section is its own component. This keeps loading states, error states, and result rendering independently readable instead of one large file mixing all of it together.

---

## 4. Key decisions & trade-offs

| Decision | Why | Trade-off |
|---|---|---|
| **Groq (Llama 3.3 70B) as the LLM provider** | Fast + free-tier-friendly, good enough structured-output reliability for this scope, lets the whole debate (5 sequential/parallel LLM calls) finish in a few seconds rather than 30+ | Not necessarily the strongest reasoning model available (e.g., GPT-4-class or Claude); a production version would likely benchmark verdict quality across providers |
| **Facts-only dossier, isolated Bull/Bear/Risk agents** | Prevents the debate from collapsing into one model agreeing with itself; makes the reasoning traceable back to specific facts | More LLM calls per run (5 total) → higher latency and cost than a single-shot prompt |
| **LLM-based ticker resolution instead of a symbol-lookup API/database** | Fast to build, works for well-known public companies out of the box | Can misresolve or hallucinate a ticker for smaller/private companies, silently degrading fundamentals quality — flagged as a known limitation |
| **Alpha Vantage marked optional, app degrades gracefully without it** | Free tier is heavily rate-limited (5 req/min, 25/day); didn't want a rate-limit hit to break the whole pipeline | Fundamentals section of the dossier can be thin/absent for some runs, more reliance on Tavily news |
| **Confidence computed in code from agent sub-scores, not left as a raw LLM number** | Each of Bull/Bear/Risk emits a bounded `strengthScore`/`severityScore`; the Judge combines them with a mandate-weighted formula so the final % is deterministic and auditable, not just "whatever the model said" | The sub-scores themselves are still LLM-assigned (just narrower and more constrained than a single holistic guess) — a further iteration could cross-check them against the dossier's actual numeric metrics |
| **No auth / rate limiting on the API** | Out of scope for a single-user take-home demo | Not production-safe as-is; anyone with the URL can call `/api/research` and spend API credits |
| **Frontend split into components + a `useDebate` hook rather than kept as one file** | Keeps state/API logic (hook) separate from presentation (components), easier to read and extend | Slightly more files to navigate for a project this size, but pays off as the UI grows |
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

1. **Cross-check the agent sub-scores against the dossier's actual numeric metrics** — `strengthScore`/`severityScore` are still LLM-assigned; a further version could partially validate them in code (e.g. penalize a high bull `strengthScore` if ROIC < WACC in the dossier) to make the confidence formula even less dependent on the model "grading itself."
2. **Replace LLM-guessed ticker resolution** with a real symbol-lookup API (or a static exchange listing) and only fall back to the LLM for unlisted/private companies.
3. **Add caching** for repeated company lookups within a short window, to reduce Tavily/Alpha Vantage/Groq calls and cost.
4. **Add basic rate limiting and an API key/auth layer** before this could be exposed publicly beyond a demo.
5. **Add automated tests** around the graph nodes (mocking the LLM/tool calls) so agent-prompt changes don't silently break structured-output parsing, and unit tests for the confidence formula itself given fixed sub-score inputs.
6. **Benchmark verdict quality across LLM providers** (Groq/Llama vs. GPT vs. Claude vs. Gemini) since the JD's production stack includes several of these — worth knowing which gives the most reliable structured reasoning for this specific task.
7. **Surface tool degradation to the user** — right now if Alpha Vantage rate-limits or Tavily returns nothing, the run still completes silently on partial data; a small UI badge ("fundamentals unavailable for this run") would make that visible instead of hidden.

---

## 7. AI tools used while building this

As instructed by the assignment, AI was used throughout. Tools used: **Claude**, **ChatGPT**, **Kimi**, and **Antigravity** for planning, code generation, debugging, and architecture review, alongside **Groq** as the production LLM provider, **Tavily** for web search, and **Alpha Vantage** for financial fundamentals. Chat session transcripts/logs are included per the bonus-points instructions in `[transcripts folder/link — add path]`.
