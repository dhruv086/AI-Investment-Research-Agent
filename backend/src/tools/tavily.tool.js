/**
 * Tavily Web Search Tool Wrapper.
 * Fetches recent news and financial articles for the target company.
 */
export const searchCompanyNews = async (companyName) => {
  const apiKey = process.env.TAVILY_API_KEY;
  
  if (!apiKey) {
    console.warn('Tavily API key is missing. Search tool will degrade gracefully and return empty results.');
    return [];
  }

  try {
    const query = `${companyName} recent business news, financial results, earnings and developments`;
    
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: 'advanced',
        max_results: 6,
        include_answers: false,
        include_raw_content: false
      })
    });

    if (!response.ok) {
      console.warn(`Tavily Search API returned status: ${response.status}. Degrading gracefully.`);
      return [];
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`Error executing Tavily search: ${error.message}. Degrading gracefully.`);
    return [];
  }
};

export default searchCompanyNews;
