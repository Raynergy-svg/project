#!/usr/bin/env node

/**
 * Script to apply email template changes to a Supabase project
 *
 * Usage:
 *   SUPABASE_ACCESS_TOKEN=your_token SUPABASE_PROJECT_ID=your_project_id node setup-email-templates.js
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

// Configuration
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

if (!SUPABASE_ACCESS_TOKEN || !SUPABASE_PROJECT_ID) {
  console.error(
    "Error: SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_ID environment variables must be set"
  );
  process.exit(1);
}

// Read email templates
const templatesDir = path.join(__dirname, "templates");
const confirmationTemplate = fs.readFileSync(
  path.join(templatesDir, "confirmation.html"),
  "utf8"
);
const recoveryTemplate = fs.readFileSync(
  path.join(templatesDir, "recovery.html"),
  "utf8"
);
const inviteTemplate = fs.readFileSync(
  path.join(templatesDir, "invite.html"),
  "utf8"
);

// API request helper
function apiRequest(method, endpoint, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.supabase.com",
      port: 443,
      path: `/v1/projects/${SUPABASE_PROJECT_ID}${endpoint}`,
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      },
    };

    const req = https.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseData));
          } catch (e) {
            resolve(responseData);
          }
        } else {
          reject(
            new Error(
              `API request failed with status ${res.statusCode}: ${responseData}`
            )
          );
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Update email templates
async function updateEmailTemplates() {
  try {
    console.log("Updating Supabase email templates...");

    // Update confirmation template
    await apiRequest("PUT", "/auth/config/templates", {
      template_type: "confirmation",
      template: {
        content: {
          html: confirmationTemplate,
        },
        subject: "Confirm Your SmartDebtFlow Account",
      },
    });
    console.log("✅ Updated confirmation template");

    // Update recovery template
    await apiRequest("PUT", "/auth/config/templates", {
      template_type: "recovery",
      template: {
        content: {
          html: recoveryTemplate,
        },
        subject: "Reset Your SmartDebtFlow Password",
      },
    });
    console.log("✅ Updated recovery template");

    // Update invite template
    await apiRequest("PUT", "/auth/config/templates", {
      template_type: "invite",
      template: {
        content: {
          html: inviteTemplate,
        },
        subject: "You've been invited to SmartDebtFlow",
      },
    });
    console.log("✅ Updated invite template");

    // Update SMTP settings if password is provided
    if (SMTP_PASSWORD) {
      await apiRequest("PUT", "/auth/config", {
        email: {
          enable_signup: true,
          double_confirm_changes: true,
          enable_confirmations: true,
          secure_password_change: true,
        },
        smtp: {
          admin_email: "admin@smartdebtflow.com",
          host: "smtp.your-email-provider.com",
          port: 587,
          user: "no-reply@smartdebtflow.com",
          pass: SMTP_PASSWORD,
          sender_name: "SmartDebtFlow",
        },
      });
      console.log("✅ Updated SMTP settings");
    } else {
      console.log("⚠️ SMTP password not provided, skipping SMTP configuration");
      console.log(
        "   Set the SMTP_PASSWORD environment variable to update SMTP settings"
      );
    }

    console.log("\n🎉 Email templates have been successfully updated!");
    console.log("\nNext steps:");
    console.log(
      "1. Verify the templates in the Supabase Dashboard (Authentication > Email Templates)"
    );
    console.log(
      "2. Test the authentication flow to ensure emails are being sent correctly"
    );
  } catch (error) {
    console.error("❌ Error updating templates:", error.message);
    process.exit(1);
  }
}

// Run the script
updateEmailTemplates();
