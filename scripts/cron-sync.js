#!/usr/bin/env node

/**
 * Cron Sync Script
 *
 * This script can be run by a cron job to automatically sync transactions.
 *
 * Usage:
 *   node scripts/cron-sync.js
 *
 * Or add to crontab:
 *   0 * * * * cd /path/to/avery-notion-sync-standalone && node scripts/cron-sync.js >> logs/cron.log 2>&1
 */

const path = require("path");
const fs = require("fs");

// Load storage
const STORAGE_FILE = path.join(__dirname, "..", "data", "config.json");

function readStorage() {
  if (!fs.existsSync(STORAGE_FILE)) {
    console.error("❌ No configuration found. Please set up the app first.");
    process.exit(1);
  }

  try {
    const data = fs.readFileSync(STORAGE_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("❌ Error reading configuration:", error.message);
    process.exit(1);
  }
}

async function runSync() {
  const config = readStorage();

  // Check if autosync is enabled
  const autosyncSettings = config.AUTOSYNC_SETTINGS;
  if (!autosyncSettings || !autosyncSettings.enabled) {
    console.log("⏸️  Auto-sync is disabled");
    process.exit(0);
  }

  // Check if database is configured
  const databaseId = config.NOTION_DATABASE_ID;
  if (!databaseId) {
    console.error("❌ Notion database not configured");
    process.exit(1);
  }

  const email = autosyncSettings.email;
  if (!email) {
    console.error("❌ Email not configured in autosync settings");
    process.exit(1);
  }

  console.log(`🔄 Starting scheduled sync for ${email}...`);

  // Calculate date range (yesterday to today)
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const fromDate = yesterday.toISOString().split("T")[0];
  const toDate = today.toISOString().split("T")[0];

  console.log(`📅 Date range: ${fromDate} to ${toDate}`);

  try {
    // Make HTTP request to local API
    const http = require("http");
    const port = process.env.PORT || 3000;

    const postData = JSON.stringify({
      email,
      fromDate,
      toDate,
    });

    const options = {
      hostname: "localhost",
      port: port,
      path: "/api/notion/sync",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const result = JSON.parse(data);
          if (result.success) {
            console.log(
              `✅ Sync complete! Synced ${result.count} transaction(s)`
            );
            process.exit(0);
          } else {
            console.error("❌ Sync failed:", result.error || "Unknown error");
            process.exit(1);
          }
        } catch (e) {
          console.error("❌ Error parsing response:", e.message);
          process.exit(1);
        }
      });
    });

    req.on("error", (error) => {
      console.error("❌ Request failed:", error.message);
      console.error("   Make sure the server is running on port", port);
      process.exit(1);
    });

    req.write(postData);
    req.end();
  } catch (error) {
    console.error("❌ Sync error:", error.message);
    process.exit(1);
  }
}

// Run the sync
runSync();

