import OpenAI from "https://esm.sh/openai";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

// Rate limiting setup
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 10; // Max 10 requests per minute
const requestLog = new Map<string, number[]>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const userRequests = requestLog.get(userId) || [];

  // Remove requests outside the window
  const recentRequests = userRequests.filter(
    (time) => now - time < RATE_LIMIT_WINDOW
  );
  requestLog.set(userId, recentRequests);

  return recentRequests.length >= MAX_REQUESTS;
}

function logRequest(userId: string) {
  const userRequests = requestLog.get(userId) || [];
  userRequests.push(Date.now());
  requestLog.set(userId, userRequests);
}

async function checkOpenAIHealth(): Promise<boolean> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a health check bot. Respond with 'OK' if everything is working.",
        },
        {
          role: "user",
          content: "Test query.",
        },
      ],
      temperature: 0.1,
      max_tokens: 10,
    });

    const response = completion.choices[0].message.content;
    return response === "OK";
  } catch (error) {
    console.error("OpenAI health check failed:", error);
    return false;
  }
}

serve(async (req) => {
  // Health check endpoint
  if (req.method === "GET" && new URL(req.url).pathname === "/health") {
    const isOpenAIHealthy = await checkOpenAIHealth();
    const status = isOpenAIHealthy ? 200 : 500;
    const message = isOpenAIHealthy ? "OK" : "Failed";

    return new Response(JSON.stringify({ status: message }), {
      headers: { "Content-Type": "application/json" },
      status,
    });
  }

  try {
    console.info("Received error analysis request");

    const body = await req.json().catch(() => {
      throw new Error("Invalid JSON payload");
    });
    
    const {
      error,
      errorInfo,
      location,
      timestamp,
      userAgent,
      viewport,
      sessionData,
    } = body;

    // Get user from auth context
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const {
      data: { user },
    } = await supabase.auth.getUser(req);
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Check rate limit
    if (isRateLimited(user.id)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Rate limit exceeded",
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 429,
        }
      );
    }

    // Log request
    logRequest(user.id);

    // Format error data for analysis
    const errorContext = `
Error Details:
- Message: ${error.message}
- Stack: ${error.stack}
- Component Stack: ${errorInfo?.componentStack}
- Location: ${location}
- Time: ${timestamp}
- User Agent: ${userAgent}
- Viewport: ${viewport.width}x${viewport.height}
- Session Duration: ${sessionData.sessionDuration}
- Platform: ${sessionData.platform}
- Language: ${sessionData.language}
    `.trim();

    // Get AI analysis with retries
    let analysis = "";
    let retries = 3;
    let fixSummary = "";
    
    while (retries > 0) {
      try {
        console.info("Calling OpenAI API for error analysis");
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are an expert software developer analyzing application errors. Your goal is to identify the root cause of the error, assess its severity, and provide the corrected code to fix it.

Follow these steps:
1. Analyze the error details provided by the user.
2. Identify the root cause of the error.
3. Assess the severity of the error (High, Medium, Low).
4. Provide the corrected code that fixes the error. Enclose the corrected code within a markdown code block.
5. If no fix is applicable, state "No fix applied."

Here's an example of the desired output format:

Root cause: [Root cause of the error]
Severity: [Severity of the error]
Corrected code:
\`\`\`
[Corrected code]
\`\`\`

If no fix is applicable, state: No fix applied.`
            },
            {
              role: "user",
              content: `Analyze this error:\n\n${errorContext}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 500,
        });

        analysis = completion.choices[0].message.content;

        // Extract the corrected code from the analysis
        const codeBlockMatch = analysis.match(/```([\s\S]*?)```/);
        const correctedCode = codeBlockMatch ? codeBlockMatch[1].trim() : null;

        fixSummary = correctedCode ? "Code automatically replaced with AI-generated fix." : "No fix applied.";
        break;
      } catch (e) {
        retries--;
        if (retries === 0) throw e;
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s before retry
      }
    }

    // Store analysis in database
    console.info("Storing error analysis in database");
    await supabase.from("error_analysis").insert({
      user_id: user.id,
      error_message: error.message,
      error_stack: error.stack,
      analysis,
      fix_summary: fixSummary,
      created_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error analyzing error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: error.message === "Unauthorized" ? 401 : 500,
      }
    );
  }
});
