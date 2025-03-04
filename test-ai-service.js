/**
 * AI Service Test Script
 *
 * This is a simple script to test the AI service directly.
 * Run this with: node test-ai-service.js
 */

const workerUrl =
  "https://curly-tooth-d4a2.projectdcertan84workersdev.workers.dev/api/ai/query";

async function testAIService() {
  console.log("Testing AI Service at:", workerUrl);

  try {
    // Make a direct request to the worker
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "Hello, this is a test query",
        context: {
          request_type: "general_query",
        },
        user_id: "test-user",
      }),
    });

    console.log("Response status:", response.status);

    const data = await response.text();

    try {
      // Try to parse as JSON
      const jsonData = JSON.parse(data);
      console.log("Response JSON:", JSON.stringify(jsonData, null, 2));
    } catch (e) {
      // If it's not JSON, show the raw text
      console.log("Response text:", data);
    }
  } catch (error) {
    console.error("Error testing AI service:", error);
  }
}

// Execute the test
testAIService();

/**
 * Instructions:
 *
 * 1. Run this script with: node test-ai-service.js
 * 2. Check the response to see if the worker is functioning correctly
 * 3. If there are errors, review the worker logs in Cloudflare dashboard
 *
 * Common issues:
 * - 500 errors may indicate an internal server error in the worker
 * - Network errors may indicate the worker is not deployed or not accessible
 * - JSON parse errors may indicate the worker is returning invalid JSON
 */
