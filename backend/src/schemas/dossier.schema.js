import { z } from 'zod';

export const DossierSchema = z.object({
  companyName: z.string().describe("The official full name of the company."),
  ticker: z.string().describe("The stock symbol/ticker of the company (e.g. AAPL, NVDA)."),
  businessOverview: z.string().describe("A brief facts-only overview of what the company does, its business model, and key divisions."),
  sector: z.string().describe("The sector or industry category the company operates in."),
  keyMetrics: z.object({
    marketCap: z.string().nullable().optional().describe("Market Capitalization, e.g. '$3.2 Trillion'"),
    peRatio: z.string().nullable().optional().describe("Price-to-Earnings Ratio, e.g. '32.4'"),
    eps: z.string().nullable().optional().describe("Earnings Per Share, e.g. '6.22'"),
    dividendYield: z.string().nullable().optional().describe("Dividend Yield percentage, e.g. '0.45%'"),
    profitMargin: z.string().nullable().optional().describe("Net profit margin percentage, e.g. '25.8%'"),
    operatingMargin: z.string().nullable().optional().describe("Operating margin percentage, e.g. '30.1%'"),
    revenueTTM: z.string().nullable().optional().describe("Revenue Trailing Twelve Months, e.g. '$385 Billion'")
  }).describe("Key financial metrics fetched from fundamentals data or estimated from news."),
  recentNews: z.array(z.object({
    title: z.string().describe("Headline or news title."),
    summary: z.string().describe("Facts extracted from the article (strictly factual, e.g. product releases, quarterly reports, legal decisions)."),
    date: z.string().optional().describe("Approximate date of the article if available.")
  })).describe("Recent key news developments, product releases, or controversies (facts only, minimum 3 items)."),
  extractedFacts: z.array(z.string()).describe("A list of concrete, objective facts about the company's financial health, competitive landscape, and recent developments. Strictly objective, no opinions.")
});

export default DossierSchema;
