require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const storage = require("./src/storage");
const AveryClient = require("./src/avery-client");
const NotionClient = require("./src/notion-client");
const { createTransactionsDatabase, runNotionSync } = require("./src/sync");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// =============================================================================
// API Routes
// =============================================================================

// Login with email (no token needed - auth is via authkey header + email)
app.post("/api/login", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const client = new AveryClient();
    console.log("Attempting to create/get user with email:", email);
    const user = await client.createUser(email);
    console.log("Received user response:", JSON.stringify(user, null, 2));

    if (user && user.email) {
      // Just store the email - no token needed!
      storage.setUserEmail(email);
      res.json({ success: true, user });
    } else {
      console.log("Invalid user response");
      res
        .status(400)
        .json({ error: "Failed to create/login user", receivedData: user });
    }
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get user token status
app.get("/api/token/status", (req, res) => {
  try {
    const token = storage.getUserToken();
    const email = storage.getUserEmail();
    res.json({ hasToken: !!token, email: email || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Notion OAuth - Direct Implementation
const NOTION_CLIENT_ID =
  process.env.NOTION_CLIENT_ID || "YOUR_NOTION_CLIENT_ID";
const NOTION_CLIENT_SECRET =
  process.env.NOTION_CLIENT_SECRET || "YOUR_NOTION_CLIENT_SECRET";
const NOTION_REDIRECT_URI =
  process.env.NOTION_REDIRECT_URI ||
  "http://localhost:3000/api/notion/oauth/callback";

// Start Notion OAuth
app.post("/api/notion/oauth/start", async (req, res) => {
  try {
    // Generate Notion OAuth URL
    const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${encodeURIComponent(
      NOTION_CLIENT_ID
    )}&response_type=code&owner=user&redirect_uri=${encodeURIComponent(
      NOTION_REDIRECT_URI
    )}`;

    res.json({ authUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Notion OAuth Callback
app.get("/api/notion/oauth/callback", async (req, res) => {
  try {
    const { code, error } = req.query;

    if (error) {
      return res.send(`
        <html>
          <body>
            <h1>OAuth Error</h1>
            <p>${error}</p>
            <script>window.close();</script>
          </body>
        </html>
      `);
    }

    if (!code) {
      return res.status(400).send("Missing authorization code");
    }

    // Exchange code for access token
    const axios = require("axios");
    const auth = Buffer.from(
      `${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`
    ).toString("base64");

    const response = await axios.post(
      "https://api.notion.com/v1/oauth/token",
      {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: NOTION_REDIRECT_URI,
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { access_token } = response.data;

    // Save the access token
    storage.setNotionAccessToken(access_token);

    // Success page
    res.send(`
      <html>
        <head>
          <style>
            body {
              font-family: 'Poppins', sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: #f8f9fa;
            }
            .success {
              text-align: center;
              padding: 40px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            h1 { color: #28a745; }
          </style>
        </head>
        <body>
          <div class="success">
            <h1>✅ Connected to Notion!</h1>
            <p>You can close this window now.</p>
            <script>
              setTimeout(() => window.close(), 2000);
            </script>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.status(500).send(`
      <html>
        <body>
          <h1>Error</h1>
          <p>${error.message}</p>
          <script>setTimeout(() => window.close(), 3000);</script>
        </body>
      </html>
    `);
  }
});

// Check Notion connection status
app.get("/api/notion/oauth/status", async (req, res) => {
  try {
    const token = storage.getNotionAccessToken();
    res.json({ connected: !!token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search Notion pages
app.post("/api/notion/pages/search", async (req, res) => {
  try {
    const { query, startCursor } = req.body;
    const notion = new NotionClient();
    const result = await notion.searchPages(query, startCursor);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Notion database
app.post("/api/notion/database/create", async (req, res) => {
  try {
    const { parentPageId } = req.body;
    const db = await createTransactionsDatabase(parentPageId);
    storage.setNotionDatabaseId(db.id);
    res.json(db);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Run sync/backfill
app.post("/api/notion/sync", async (req, res) => {
  try {
    const { fromDate, toDate, email } = req.body;
    const dbId = storage.getNotionDatabaseId();

    if (!dbId) {
      return res.status(400).json({ error: "Notion database not configured" });
    }

    const result = await runNotionSync(dbId, fromDate, toDate, email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List accounts
app.get("/api/accounts/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const client = new AveryClient();
    const accounts = await client.listAccountsForEmail(email);
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Apply promo code
app.post("/api/promo/apply", async (req, res) => {
  try {
    const { email, code } = req.body;
    const client = new AveryClient();
    const result = await client.applyPromoCode(email, code);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Track event
app.post("/api/track", async (req, res) => {
  try {
    const { email, event, data } = req.body;
    const client = new AveryClient();
    const result = await client.trackEvent(email, event, data);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Category rules
app.get("/api/categories/rules", (req, res) => {
  try {
    const rules = storage.listCategoryRules();
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/categories/rules", (req, res) => {
  try {
    const { matchText, category } = req.body;
    const rules = storage.saveCategoryRule(matchText, category);
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/categories/rules", (req, res) => {
  try {
    storage.resetCategoryRules();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Notion database info
app.get("/api/notion/database", async (req, res) => {
  try {
    const dbId = storage.getNotionDatabaseId();
    if (!dbId) {
      return res.json({ configured: false });
    }

    const notion = new NotionClient();
    const db = await notion.getDatabase(dbId);
    res.json({ configured: true, database: db });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Auto-categorization
app.post("/api/ai/suggest-categories", async (req, res) => {
  try {
    const { email, fromDate, toDate } = req.body;
    const client = new AveryClient();

    // Get transactions
    const transactions =
      (await client.listUserTransactionsWithinPeriod(
        email,
        fromDate,
        toDate
      )) || [];
    const transactionDescriptions = transactions.map((t) => ({
      description: t.description || t.merchant || t.memo || "",
      transactionId: t.id || t.transactionId || t.transaction_id,
    }));

    // Get existing categories from Notion database
    let categories = [];
    try {
      const dbId = storage.getNotionDatabaseId();
      if (dbId) {
        const notion = new NotionClient();
        const db = await notion.getDatabase(dbId);
        const props = db && db.properties && db.properties["Category"];
        if (props && props.select && props.select.options) {
          categories = props.select.options.map((o) => o.name);
        }
      }
    } catch (e) {}

    // Add categories from rules
    const rules = storage.listCategoryRules();
    const ruleCats = rules.map((r) => r.category);
    categories = [...new Set([...categories, ...ruleCats])].filter(Boolean);

    // Call AI categorization endpoint
    const result = await client.aiSuggestCategories(
      transactionDescriptions,
      categories
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check for expired consents (reconsent)
app.get("/api/reconsent/check/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const client = new AveryClient();
    const result = await client.checkForExpiredConsent(email);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset configuration
app.post("/api/reset", (req, res) => {
  try {
    storage.reset();
    res.json({ success: true, message: "Configuration reset successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// Serve frontend
// =============================================================================

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(
    `✅ Avery Notion Sync server running on http://localhost:${PORT}`
  );
  console.log(`📊 Storage location: ${storage.getStoragePath()}`);
});
