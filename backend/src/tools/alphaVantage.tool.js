/**
 * Alpha Vantage Fundamentals Tool Wrapper.
 * Fetches company overview, income statements, balance sheets, and cash flows.
 * Calculates EBITDA, Free Cash Flow, and Working Capital.
 * Degrades gracefully if key is missing, rate-limit is hit, or the symbol is invalid.
 */
export const fetchCompanyOverview = async (symbol) => {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    console.warn('Alpha Vantage API key is missing. Fundamentals tool will degrade gracefully and return null.');
    return null;
  }

  const cleanSymbol = symbol.trim().toUpperCase();
  const dataStore = {
    overview: null,
    income: null,
    balance: null,
    cashflow: null
  };

  // Helper fetcher to catch rate limits
  const fetchEndpoint = async (func) => {
    try {
      const url = `https://www.alphavantage.co/query?function=${func}&symbol=${cleanSymbol}&apikey=${apiKey}`;
      const response = await fetch(url);
      if (!response.ok) return null;
      const json = await response.json();
      if (json.Note || json.Information) {
        console.warn(`Alpha Vantage rate limit reached on endpoint "${func}".`);
        return 'LIMIT';
      }
      return json;
    } catch (err) {
      console.error(`Error querying Alpha Vantage endpoint ${func}: ${err.message}`);
      return null;
    }
  };

  try {
    // 1. Fetch Overview (primary)
    console.log(`Alpha Vantage: Querying OVERVIEW for "${cleanSymbol}"...`);
    const overviewData = await fetchEndpoint('OVERVIEW');
    if (overviewData === 'LIMIT' || !overviewData || !overviewData.Symbol) {
      return null;
    }
    dataStore.overview = overviewData;

    // 2. Fetch Income Statement
    console.log(`Alpha Vantage: Querying INCOME_STATEMENT for "${cleanSymbol}"...`);
    const incomeData = await fetchEndpoint('INCOME_STATEMENT');
    if (incomeData && incomeData !== 'LIMIT') {
      dataStore.income = incomeData;
    }

    // 3. Fetch Balance Sheet
    console.log(`Alpha Vantage: Querying BALANCE_SHEET for "${cleanSymbol}"...`);
    const balanceData = await fetchEndpoint('BALANCE_SHEET');
    if (balanceData && balanceData !== 'LIMIT') {
      dataStore.balance = balanceData;
    }

    // 4. Fetch Cash Flow
    console.log(`Alpha Vantage: Querying CASH_FLOW for "${cleanSymbol}"...`);
    const cashData = await fetchEndpoint('CASH_FLOW');
    if (cashData && cashData !== 'LIMIT') {
      dataStore.cashflow = cashData;
    }

    // Process gathered statistics
    const metrics = {};
    const overview = dataStore.overview;
    
    // Base overview parameters
    metrics.companyName = overview.Name || null;
    metrics.ticker = overview.Symbol || null;
    metrics.businessOverview = overview.Description || null;
    metrics.sector = overview.Sector || null;
    metrics.marketCap = overview.MarketCapitalization ? `$${(parseInt(overview.MarketCapitalization) / 1e9).toFixed(2)} Billion` : null;
    metrics.peRatio = overview.PERatio || null;
    metrics.eps = overview.EarningsPerShare || null;
    metrics.dividendYield = overview.DividendYield ? `${(parseFloat(overview.DividendYield) * 100).toFixed(2)}%` : null;
    metrics.profitMargin = overview.ProfitMargin ? `${(parseFloat(overview.ProfitMargin) * 100).toFixed(2)}%` : null;
    metrics.operatingMargin = overview.OperatingMarginTTM ? `${(parseFloat(overview.OperatingMarginTTM) * 100).toFixed(2)}%` : null;
    metrics.revenueTTM = overview.RevenueTTM ? `$${(parseInt(overview.RevenueTTM) / 1e9).toFixed(2)} Billion` : null;

    // Estimate EBITDA from Income Statement (EBITDA = Operating Income + Depreciation & Amortization)
    if (dataStore.income?.annualReports?.length > 0) {
      const recentReport = dataStore.income.annualReports[0];
      const operatingIncome = parseInt(recentReport.operatingIncome) || 0;
      const ebit = parseInt(recentReport.ebit) || operatingIncome;
      const depreciation = parseInt(recentReport.depreciationAndAmortization) || 0;
      const ebitdaVal = ebit + depreciation;
      metrics.ebitda = ebitdaVal ? `$${(ebitdaVal / 1e9).toFixed(2)} Billion` : null;
    }

    // Working Capital from Balance Sheet (Working Capital = Current Assets - Current Liabilities)
    if (dataStore.balance?.annualReports?.length > 0) {
      const recentReport = dataStore.balance.annualReports[0];
      const currentAssets = parseInt(recentReport.totalCurrentAssets) || 0;
      const currentLiabilities = parseInt(recentReport.totalCurrentLiabilities) || 0;
      const wcVal = currentAssets - currentLiabilities;
      metrics.workingCapital = wcVal ? `$${(wcVal / 1e9).toFixed(2)} Billion` : null;
    }

    // Free Cash Flow from Cash Flow statement (FCF = Operating Cash Flow - CapEx)
    if (dataStore.cashflow?.annualReports?.length > 0) {
      const recentReport = dataStore.cashflow.annualReports[0];
      const operatingCashflow = parseInt(recentReport.operatingCashflow) || 0;
      const capitalExpenditures = parseInt(recentReport.capitalExpenditures) || 0;
      const fcfVal = operatingCashflow - capitalExpenditures;
      metrics.freeCashFlow = fcfVal ? `$${(fcfVal / 1e9).toFixed(2)} Billion` : null;
    }

    return metrics;
  } catch (error) {
    console.error(`Error processing Alpha Vantage datasets: ${error.message}. Degrading gracefully.`);
    return null;
  }
};

export default fetchCompanyOverview;
