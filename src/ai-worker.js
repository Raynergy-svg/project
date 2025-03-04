// AI Worker Implementation
export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      // For logging - log environment info without exposing sensitive data
      console.log(`AI Worker running in ${env.ENVIRONMENT} mode`, {
        supabaseConfigured: !!env.SUPABASE_URL,
      });

      // For OPTIONS requests (CORS preflight)
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      // Handle AI query endpoint
      if (pathname === "/api/ai/query" && request.method === "POST") {
        const requestBody = await request.json();
        const { query, context, user_id } = requestBody;

        if (!query) {
          return new Response(
            JSON.stringify({
              success: false,
              message: "Missing query parameter",
              query: "",
              error: "Query parameter is required",
            }),
            {
              status: 400,
              headers: getCorsHeaders(),
            }
          );
        }

        // Process different types of queries based on context
        const requestType = context?.request_type || "general_query";
        let result;

        console.log(
          `Processing ${requestType} request from user ${
            user_id || "anonymous"
          }`
        );

        switch (requestType) {
          case "debt_recommendations":
            result = await processDebtRecommendations(query, context);
            break;
          case "transaction_analysis":
            result = await processTransactionAnalysis(query, context);
            break;
          default:
            result = await processGeneralQuery(query, context);
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: "AI request processed successfully",
            query,
            ...result,
          }),
          {
            status: 200,
            headers: getCorsHeaders(),
          }
        );
      }

      // Handle simple test endpoint
      if (pathname === "/api/ai/test") {
        return new Response(
          JSON.stringify({
            success: true,
            message: "AI worker is running correctly",
            timestamp: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: getCorsHeaders(),
          }
        );
      }

      // If not a valid endpoint, return 404
      return new Response(
        JSON.stringify({
          error: "Not found",
          message: "The requested endpoint does not exist",
        }),
        {
          status: 404,
          headers: getCorsHeaders(),
        }
      );
    } catch (error) {
      console.error("AI Worker Error:", error);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Internal Server Error",
          message: error.message,
          environment: env.ENVIRONMENT || "unknown",
        }),
        {
          status: 500,
          headers: getCorsHeaders(),
        }
      );
    }
  },
};

/**
 * Get CORS headers for responses
 */
function getCorsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

/**
 * Process debt recommendation requests
 * @param {string} query The user's query
 * @param {object} context Request context including debts and income
 * @returns {object} Processed recommendations
 */
async function processDebtRecommendations(query, context) {
  const { debts, income } = context;

  // Simple mock implementation - in a real app, this would use AI services
  const recommendations = [
    "Based on your current debt profile, consider focusing on high-interest debts first.",
    `With your income of $${income}, aim to allocate 20% towards debt repayment.`,
    "Consider debt consolidation to reduce overall interest rates.",
  ];

  // Add debt-specific recommendations if we have debt data
  if (debts && debts.length > 0) {
    const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);
    const debtToIncomeRatio = totalDebt / (income * 12); // Annualized income

    recommendations.push(
      `Your debt-to-income ratio is ${(debtToIncomeRatio * 100).toFixed(
        1
      )}%. ` +
        (debtToIncomeRatio > 0.4
          ? "This is high and may affect your credit score."
          : "This is within a manageable range.")
    );
  }

  return {
    recommendations,
    // Include any other relevant data
  };
}

/**
 * Process transaction analysis requests
 * @param {string} query The user's query
 * @param {object} context Request context including transactions
 * @returns {object} Analysis results
 */
async function processTransactionAnalysis(query, context) {
  const { transactions } = context;

  // Simple mock implementation - in a real app, this would use AI services
  let result = {
    summary: "Transaction analysis complete",
    insights: [],
  };

  if (transactions && transactions.length > 0) {
    const categories = {};

    // Categorize transactions
    transactions.forEach((tx) => {
      const category = tx.category || "Uncategorized";
      if (!categories[category]) {
        categories[category] = { count: 0, total: 0 };
      }
      categories[category].count++;
      categories[category].total += tx.amount;
    });

    // Generate insights
    result.insights = Object.entries(categories).map(
      ([category, data]) =>
        `You spent ${data.total} on ${category} across ${data.count} transactions.`
    );
  } else {
    result.insights = ["No transaction data available for analysis."];
  }

  return {
    result,
  };
}

/**
 * Process general queries
 * @param {string} query The user's query
 * @param {object} context Any additional context
 * @returns {object} Query response
 */
async function processGeneralQuery(query, context) {
  // Simple mock implementation - in a real app, this would use AI services
  return {
    result: `I processed your query: "${query}". In a production environment, this would be handled by a full AI model.`,
  };
}
