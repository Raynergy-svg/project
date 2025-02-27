import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

// Proxy middleware options
const options = {
  target: "https://gnwdahoiauduyncppbdb.supabase.co",
  changeOrigin: true,
  pathRewrite: {
    "^/supabase": "", // remove /supabase path
  },
  onProxyRes: function (proxyRes, req, res) {
    // Add CORS headers to the proxied response
    proxyRes.headers["Access-Control-Allow-Origin"] = "*";
    proxyRes.headers["Access-Control-Allow-Methods"] =
      "GET,HEAD,PUT,PATCH,POST,DELETE";
    proxyRes.headers["Access-Control-Allow-Headers"] =
      "Content-Type, Authorization, apikey";
  },
  logLevel: "debug",
};

// Create the proxy middleware
const supabaseProxy = createProxyMiddleware(options);

// Use the proxy for all routes starting with /supabase
app.use("/supabase", supabaseProxy);

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
