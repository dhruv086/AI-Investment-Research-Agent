/**
 * Alpha Vantage Fundamentals Tool Wrapper.
 * Fetches core balance sheet and valuation metrics for a given stock symbol.
 * Degrades gracefully if key is missing, rate-limit is hit, or the symbol is invalid.
 */
export const fetchCompanyOverview = async (symbol) => {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    console.warn('Alpha Vantage API key is missing. Fundamentals tool will degrade gracefully and return null.');
    return null;
  }

  // Ensure we have a clean ticker symbol (uppercase, trimmed)
  const cleanSymbol = symbol.trim().toUpperCase();

  try {
    const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${cleanSymbol}&apikey=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Alpha Vantage API returned status: ${response.status}. Degrading gracefully.`);
      return null;
    }

    const data = await response.json();

    // Alpha Vantage returns a message when rate limit (5 API calls per minute) is hit
    if (data.Note || data.Information) {
      console.warn('Alpha Vantage free-tier rate limit reached. Degrading gracefully to no-persistence/no-data mode.');
      return null;
    }

    // If we get an empty object or it doesn't match a stock Overview
    if (!data.Symbol) {
      console.warn(`Alpha Vantage returned no data for symbol: ${cleanSymbol}. Symbol might not be found.`);
      return null;
    }

    // Map Alpha Vantage response fields to our metrics schema
    return {
      companyName: data.Name || null,
      ticker: data.Symbol || null,
      businessOverview: data.Description || null,
      sector: data.Sector || null,
      marketCap: data.MarketCapitalization ? `$${(parseInt(data.MarketCapitalization) / 1e9).toFixed(2)} Billion` : null,
      peRatio: data.PERatio || null,
      eps: data.EarningsPerShare || null,
      dividendYield: data.DividendYield ? `${(parseFloat(data.DividendYield) * 100).toFixed(2)}%` : null,
      profitMargin: data.ProfitMargin ? `${(parseFloat(data.ProfitMargin) * 100).toFixed(2)}%` : null,
      operatingMargin: data.OperatingMarginTTM ? `${(parseFloat(data.OperatingMarginTTM) * 100).toFixed(2)}%` : null,
      revenueTTM: data.RevenueTTM ? `$${(parseInt(data.RevenueTTM) / 1e9).toFixed(2)} Billion` : null
    };
  } catch (error) {
    console.error(`Error fetching Alpha Vantage data: ${error.message}. Degrading gracefully.`);
    return null;
  }
};

export default fetchCompanyOverview;
