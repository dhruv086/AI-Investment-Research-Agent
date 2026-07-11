import { ChatGroq } from '@langchain/groq';
import searchCompanyNews from '../tools/tavily.tool.js';
import fetchCompanyOverview from '../tools/alphaVantage.tool.js';
import DossierSchema from '../schemas/dossier.schema.js';

/**
 * Resolves a company name to its primary stock ticker symbol using a quick LLM call.
 */
const resolveTicker = async (companyName) => {
  const cleanInput = companyName.trim();
  
  if (/^[A-Z]{1,5}$/i.test(cleanInput)) {
    return cleanInput.toUpperCase();
  }

  try {
    const resolverModel = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      maxTokens: 10
    });

    const response = await resolverModel.invoke([
      {
        role: "system",
        content: "You are a financial database ticker lookup assistant. Given a company name, output ONLY its primary stock ticker symbol (e.g. 'Apple Inc.' -> 'AAPL', 'Tesla' -> 'TSLA'). Do not write any other words or punctuation. If it has no ticker, output 'NONE'."
      },
      {
        role: "user",
        content: cleanInput
      }
    ]);

    const result = response.content.trim().toUpperCase().replace(/[^A-Z]/g, '');
    return result === 'NONE' ? 'GENERIC' : (result || 'GENERIC');
  } catch (error) {
    console.error(`Failed to resolve ticker: ${error.message}. Defaulting to generic.`);
    return 'GENERIC';
  }
};

/**
 * ResearchAgent Node: Compiles raw data and formats it into a structured Zod-validated dossier.
 */
export const runResearchAgent = async (state) => {
  const { companyName } = state;
  if (!companyName) {
    throw new Error('ResearchAgent requires a companyName parameter.');
  }

  // 1. Resolve stock symbol
  console.log(`ResearchAgent: Resolving ticker for "${companyName}"...`);
  const ticker = await resolveTicker(companyName);
  console.log(`ResearchAgent: Ticker resolved to "${ticker}".`);

  // 2. Fetch news (with expanded queries) and fundamentals in parallel
  console.log(`ResearchAgent: Fetching news & fundamentals data in parallel for "${ticker}"...`);
  
  // Construct a specialized query focusing on the required financial, legal, and growth terms
  const searchCompanyQuery = `${companyName} recent financial performance, TAM, WACC, customer acquisition cost CAC, LTV, CAGR, and funding deal terms`;

  const [newsResults, fundamentals] = await Promise.all([
    searchCompanyNews(searchCompanyQuery),
    ticker !== 'GENERIC' ? fetchCompanyOverview(ticker) : Promise.resolve(null)
  ]);

  console.log(`ResearchAgent: Fetching complete. News items: ${newsResults.length}. Fundamentals found: ${!!fundamentals}`);

  // 3. Prepare information context for LLM synthesis
  const newsContext = newsResults.map((item, idx) => {
    return `News #${idx + 1}:\nTitle: ${item.title}\nURL: ${item.url}\nContent Snippet: ${item.content}\n`;
  }).join('\n');

  const fundamentalsContext = fundamentals 
    ? JSON.stringify(fundamentals, null, 2)
    : 'No fundamentals data fetched from Alpha Vantage.';

  // 4. Use ChatGroq with Zod structured output to build the dossier
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    console.error('ResearchAgent: GROQ_API_KEY is missing from environment.');
    throw new Error('GROQ_API_KEY is missing. Please configure it in your backend/.env file.');
  }

  const model = new ChatGroq({
    apiKey: groqKey,
    model: "llama-3.3-70b-versatile",
    temperature: 0.1 // Low temperature to avoid hallucination/opinions
  });

  const structuredLlm = model.withStructuredOutput(DossierSchema, {
    name: "DossierExtractor"
  });

  const systemMessage = `You are the ResearchAgent, an elite financial intelligence collector.
Your mandate is to compile a highly structured, facts-only "dossier" on the target company.
You must synthesize the raw News Search Results and Fundamentals Data provided below.

Strict Constraints:
- FACTS ONLY. Do not write opinions, evaluations, recommendations, or qualitative comments.
- Populate all fields in:
  1. financialValuationMetrics (EBITDA, Gross Margin, Free Cash Flow, etc. Calculate or extract them where possible).
  2. dealLegalTerms (For public companies, set terms like Liquidation Preference to 'Public Equity Standard' or null if not applicable. For private startups, extract details regarding their valuation, preferences, or vesting if found in the news).
  3. marketGrowthTerms (Extract or estimate TAM, SAM, SOM, CAGR, Churn, and Unit Economics).
  4. performanceReturnMetrics (Extract or estimate ROIC, WACC, IRR, MOIC, etc.).
- Ensure all recentNews items contain strictly factual descriptions of business events (earnings reports, product releases, executive changes, regulatory audits, lawsuits).
- Do not make recommendations to invest or pass. Your job is data assembly.`;

  const userContent = `Company Name Request: ${companyName} (Ticker: ${ticker})

--- FUNDAMENTALS DATA (ALPHA VANTAGE) ---
${fundamentalsContext}

--- NEWS SEARCH RESULTS (TAVILY) ---
${newsContext}`;

  console.log('ResearchAgent: Orchestrating LLM synthesis for Dossier JSON...');
  
  const dossier = await structuredLlm.invoke([
    { role: "system", content: systemMessage },
    { role: "user", content: userContent }
  ]);

  console.log('ResearchAgent: Dossier generated successfully.');
  return { dossier };
};

export default runResearchAgent;
