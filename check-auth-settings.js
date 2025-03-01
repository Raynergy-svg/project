#!/usr/bin/env node

import fetch from "node-fetch";

// For local Supabase instance
const LOCAL_SUPABASE_URL = "http://localhost:54321";

async function checkAuthSettings() {
  try {
    console.log("Checking Supabase Authentication Settings:");
    console.log("----------------------------------------");

    // 1. Check local auth settings
    console.log("Fetching local auth configuration...");

    try {
      const response = await fetch(`${LOCAL_SUPABASE_URL}/auth/v1/settings`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const settings = await response.json();
        console.log("\nCurrent Auth Settings:");
        console.log(JSON.stringify(settings, null, 2));

        // Check for captcha settings
        if (settings.external_captcha_enabled) {
          console.log("\n⚠️ CAPTCHA IS ENABLED:");
          console.log(`Provider: ${settings.external_captcha_provider}`);
          console.log("This could be causing user signup issues!");
          console.log(
            "\nTo disable captcha, update your supabase/config.toml file:"
          );
          console.log(
            "1. Make sure the [auth.captcha] section is commented out or set enabled = false"
          );
          console.log(
            "2. Restart your Supabase instance with: supabase stop && supabase start"
          );
        } else {
          console.log("\n✅ CAPTCHA IS DISABLED");
        }

        // Check email settings
        console.log("\nEmail Settings:");
        console.log(
          `SMTP Enabled: ${settings.smtp_admin_email ? "YES" : "NO"}`
        );
        console.log(
          `Email Provider: ${settings.smtp_host || "Not configured"}`
        );
        console.log(`Sender Email: ${settings.smtp_user || "Not configured"}`);
        console.log(
          `Email Confirmation Required: ${
            settings.enable_confirmations ? "YES" : "NO"
          }`
        );
      } else {
        console.error(
          `Error fetching auth settings: ${response.status} ${response.statusText}`
        );
        console.log("Response:", await response.text());
      }
    } catch (error) {
      console.error("Failed to check local auth settings:", error.message);
    }

    // 2. Check for running services
    console.log("\nChecking Supabase services status...");
    try {
      const statusResponse = await fetch(`${LOCAL_SUPABASE_URL}/status`);
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        console.log(
          "Supabase Status:",
          statusData.version ? "RUNNING" : "ISSUE DETECTED"
        );

        if (statusData.version) {
          console.log(`Version: ${statusData.version}`);
        }
      } else {
        console.log("Supabase status check failed");
      }
    } catch (error) {
      console.error("Failed to check Supabase status:", error.message);
    }

    console.log("\nRecommendations:");
    console.log("1. If captcha is enabled, disable it in config.toml");
    console.log("2. Verify SMTP settings are correct");
    console.log(
      "3. Check that email templates exist and are properly configured"
    );
    console.log("4. Try restarting your Supabase instance");
  } catch (error) {
    console.error("Script error:", error);
  }
}

checkAuthSettings();
