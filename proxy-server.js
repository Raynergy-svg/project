import http from "http";
import https from "https";
import { parse } from "url";

const PORT = 3000;
const SUPABASE_URL = "gnwdahoiauduyncppbdb.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdud2RhaG9pYXVkdXluY3BwYmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMzg2MTksImV4cCI6MjA1NTgxNDYxOX0.enn_-enfIn0b7Q2qPkrwnVTF7iQYcGoAD6d54-ac77U";

// Create a server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type,apikey,Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`Received ${req.method} request to ${req.url}`);

  // Log headers for debugging
  console.log("Request headers:", req.headers);

  // Get the request body
  let body = [];
  req
    .on("data", (chunk) => {
      body.push(chunk);
    })
    .on("end", () => {
      body = Buffer.concat(body).toString();

      // Log body for debugging
      if (body && body.length > 0) {
        try {
          console.log("Request body:", JSON.parse(body));
        } catch (e) {
          console.log("Request body (raw):", body);
        }
      }

      // Parse the request URL
      const parsedUrl = parse(req.url);

      // Forward the request to Supabase (using HTTPS)
      const options = {
        hostname: SUPABASE_URL,
        port: 443,
        path: parsedUrl.path,
        method: req.method,
        headers: {
          ...req.headers,
          host: SUPABASE_URL,
          apikey: SUPABASE_KEY, // Always include the API key
        },
      };

      // Remove headers that might cause issues
      delete options.headers["host"];
      delete options.headers["connection"];

      console.log(`Forwarding to https://${SUPABASE_URL}${parsedUrl.path}`);
      console.log("Forwarding with headers:", options.headers);

      // Create the request to Supabase (using HTTPS)
      const proxyReq = https.request(options, (proxyRes) => {
        console.log("Response status:", proxyRes.statusCode);
        console.log("Response headers:", proxyRes.headers);

        // Copy the response headers
        Object.keys(proxyRes.headers).forEach((key) => {
          res.setHeader(key, proxyRes.headers[key]);
        });

        // Set status code
        res.writeHead(proxyRes.statusCode);

        // Collect response data
        let responseData = [];
        proxyRes.on("data", (chunk) => {
          responseData.push(chunk);
          res.write(chunk);
        });

        proxyRes.on("end", () => {
          const responseBody = Buffer.concat(responseData).toString();
          console.log(
            `Response received from Supabase with status: ${proxyRes.statusCode}`
          );

          // Log response body for debugging
          if (responseBody && responseBody.length > 0) {
            try {
              console.log("Response body:", JSON.parse(responseBody));
            } catch (e) {
              console.log("Response body (raw):", responseBody);
            }
          }

          res.end();
        });
      });

      // Handle errors
      proxyReq.on("error", (error) => {
        console.error("Error forwarding request to Supabase:", error);
        res.writeHead(500);
        res.end("Proxy error: " + error.message);
      });

      // Send the request body to Supabase
      if (body) {
        proxyReq.write(body);
      }
      proxyReq.end();
    });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
  console.log(`Forwarding requests to https://${SUPABASE_URL}`);
  console.log(`Using API key: ${SUPABASE_KEY}`);
});
