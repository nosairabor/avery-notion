// Global state
let selectedParentPageId = null;
let selectedParentPageName = null;
let pollInterval = null;
let currentUser = null;

// Utility functions
function showStatus(elementId, message, type = "info") {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.className = "status";
  if (type === "success") el.classList.add("success");
  if (type === "error") el.classList.add("error");
}

function showSpinner(elementId) {
  const el = document.getElementById(elementId);
  el.innerHTML = '<span class="spinner"></span>Loading...';
  el.className = "status";
}

async function apiCall(method, path, body = null) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(path, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    return data;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
}

// Login with email (no token needed!)
async function loginWithEmail() {
  const email = document.getElementById("login-email").value.trim();

  if (!email) {
    showStatus("login-status", "❌ Please enter your email", "error");
    return;
  }

  // Basic email validation
  if (!email.includes("@")) {
    showStatus("login-status", "❌ Please enter a valid email", "error");
    return;
  }

  try {
    showSpinner("login-status");
    const result = await apiCall("POST", "/api/login", { email });

    if (result.success) {
      currentUser = result.user;
      showStatus(
        "login-status",
        "✅ Logged in successfully! Redirecting...",
        "success"
      );

      // Hide login card, show logged-in card
      setTimeout(() => {
        document.getElementById("login-card").classList.add("hidden");
        document.getElementById("logged-in-card").classList.remove("hidden");
        document.getElementById("logged-in-email").textContent = email;
        showStatus("login-status", "", "");
      }, 1000);
    } else {
      showStatus("login-status", "❌ Login failed", "error");
    }
  } catch (error) {
    showStatus("login-status", `❌ Error: ${error.message}`, "error");
  }
}

// Step 1: Connect Notion
async function connectNotion() {
  try {
    showSpinner("notion-status");

    // Start OAuth flow
    const result = await apiCall("POST", "/api/notion/oauth/start");

    if (result.authUrl) {
      showStatus(
        "notion-status",
        "🔄 Opening Notion auth in new window. Please authorize...",
        "info"
      );

      // Open auth URL in new window
      window.open(result.authUrl, "_blank");

      // Start polling for status
      pollOAuthStatus();
    } else {
      showStatus("notion-status", "❌ Failed to start OAuth", "error");
    }
  } catch (error) {
    showStatus("notion-status", `❌ Error: ${error.message}`, "error");
  }
}

async function pollOAuthStatus() {
  // Clear any existing poll
  if (pollInterval) clearInterval(pollInterval);

  pollInterval = setInterval(async () => {
    try {
      const status = await apiCall("GET", "/api/notion/oauth/status");

      if (status.connected) {
        clearInterval(pollInterval);
        showStatus(
          "notion-status",
          "✅ Notion connected successfully!",
          "success"
        );
        document
          .getElementById("choose-parent-card")
          .classList.remove("hidden");
      }
    } catch (error) {
      console.error("Poll error:", error);
    }
  }, 2000); // Poll every 2 seconds
}

// Step 2: Search pages
async function searchPages() {
  const query = document.getElementById("page-search").value.trim();

  try {
    showSpinner("search-status");
    const result = await apiCall("POST", "/api/notion/pages/search", {
      query,
      startCursor: null,
    });

    const results = result.results || [];
    const container = document.getElementById("search-results");
    container.innerHTML = "";

    if (results.length === 0) {
      container.innerHTML =
        '<div style="padding: 12px; color: #999;">No pages found</div>';
      showStatus("search-status", "No results", "info");
      return;
    }

    results.forEach((page) => {
      if (page.object !== "page") return;

      const title =
        page.properties?.title?.title?.[0]?.plain_text || "Untitled";
      const emoji = page.icon?.emoji || "📄";

      const div = document.createElement("div");
      div.className = "page-item";
      div.innerHTML = `${emoji} ${title}`;
      div.onclick = () => selectPage(page.id, title);

      container.appendChild(div);
    });

    showStatus("search-status", `Found ${results.length} page(s)`, "success");
  } catch (error) {
    showStatus("search-status", `❌ Error: ${error.message}`, "error");
  }
}

function selectPage(pageId, pageName) {
  selectedParentPageId = pageId;
  selectedParentPageName = pageName;

  // Update UI
  const items = document.querySelectorAll(".page-item");
  items.forEach((item) => item.classList.remove("selected"));
  event.target.classList.add("selected");

  // Show create database card
  document.getElementById("create-db-card").classList.remove("hidden");
  document.getElementById("selected-page-name").textContent = pageName;
  showStatus("search-status", `✅ Selected: ${pageName}`, "success");
}

// Step 3: Create database
async function createDatabase() {
  if (!selectedParentPageId) {
    showStatus("db-status", "❌ Please select a parent page first", "error");
    return;
  }

  try {
    showSpinner("db-status");
    const result = await apiCall("POST", "/api/notion/database/create", {
      parentPageId: selectedParentPageId,
    });

    showStatus("db-status", "✅ Database created successfully!", "success");
    document.getElementById("sync-card").classList.remove("hidden");
  } catch (error) {
    showStatus("db-status", `❌ Error: ${error.message}`, "error");
  }
}

// Step 4: Run sync
async function runSync() {
  const email = document.getElementById("sync-email").value.trim();
  const fromDate = document.getElementById("from-date").value;
  const toDate = document.getElementById("to-date").value;

  if (!email) {
    showStatus("sync-status", "❌ Please enter your email", "error");
    return;
  }

  try {
    showSpinner("sync-status");
    const result = await apiCall("POST", "/api/notion/sync", {
      email,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    });

    showStatus(
      "sync-status",
      `✅ Synced ${result.count} transaction(s)!`,
      "success"
    );
  } catch (error) {
    showStatus("sync-status", `❌ Error: ${error.message}`, "error");
  }
}

// Additional features
async function listAccounts() {
  const email = document.getElementById("accounts-email").value.trim();

  if (!email) {
    showStatus("accounts-status", "❌ Please enter your email", "error");
    return;
  }

  try {
    showSpinner("accounts-status");
    const accounts = await apiCall(
      "GET",
      `/api/accounts/${encodeURIComponent(email)}`
    );

    if (!accounts || accounts.length === 0) {
      showStatus("accounts-status", "No accounts found", "info");
      return;
    }

    const accountsList = accounts
      .map(
        (acc) =>
          `• ${acc.name || acc.accountName || "Unknown"} (${
            acc.institutionName || "N/A"
          })`
      )
      .join("\n");

    showStatus(
      "accounts-status",
      `Found ${accounts.length} account(s):\n${accountsList}`,
      "success"
    );
  } catch (error) {
    showStatus("accounts-status", `❌ Error: ${error.message}`, "error");
  }
}

async function addCategoryRule() {
  const matchText = document.getElementById("rule-match").value.trim();
  const category = document.getElementById("rule-category").value.trim();

  if (!matchText || !category) {
    showStatus(
      "rules-status",
      "❌ Please enter both match text and category",
      "error"
    );
    return;
  }

  try {
    showSpinner("rules-status");
    await apiCall("POST", "/api/categories/rules", { matchText, category });
    showStatus("rules-status", "✅ Rule added successfully!", "success");

    // Clear inputs
    document.getElementById("rule-match").value = "";
    document.getElementById("rule-category").value = "";
  } catch (error) {
    showStatus("rules-status", `❌ Error: ${error.message}`, "error");
  }
}

async function listCategoryRules() {
  try {
    showSpinner("rules-status");
    const rules = await apiCall("GET", "/api/categories/rules");

    if (!rules || rules.length === 0) {
      showStatus("rules-status", "No rules found", "info");
      return;
    }

    const rulesList = rules
      .map((rule, i) => `${i + 1}. "${rule.match}" → ${rule.category}`)
      .join("\n");

    showStatus(
      "rules-status",
      `${rules.length} rule(s):\n${rulesList}`,
      "success"
    );
  } catch (error) {
    showStatus("rules-status", `❌ Error: ${error.message}`, "error");
  }
}

async function resetCategoryRules() {
  if (!confirm("Are you sure you want to reset all category rules?")) {
    return;
  }

  try {
    showSpinner("rules-status");
    await apiCall("DELETE", "/api/categories/rules");
    showStatus("rules-status", "✅ Rules reset successfully!", "success");
  } catch (error) {
    showStatus("rules-status", `❌ Error: ${error.message}`, "error");
  }
}

function openBankConnect() {
  window.open("https://app.averyapp.ai", "_blank");
}

async function resetConfig() {
  if (!confirm("⚠️ This will delete ALL stored configuration. Are you sure?")) {
    return;
  }

  try {
    showSpinner("reset-status");
    await apiCall("POST", "/api/reset");
    showStatus(
      "reset-status",
      "✅ Configuration reset successfully!",
      "success"
    );

    // Hide cards
    document.getElementById("choose-parent-card").classList.add("hidden");
    document.getElementById("create-db-card").classList.add("hidden");
    document.getElementById("sync-card").classList.add("hidden");

    // Clear state
    selectedParentPageId = null;
    selectedParentPageName = null;
  } catch (error) {
    showStatus("reset-status", `❌ Error: ${error.message}`, "error");
  }
}

// AI Categorization
let aiSuggestedRules = [];

async function aiSuggestCategories() {
  const email = document.getElementById("ai-email").value.trim();
  const fromDate = document.getElementById("ai-from-date").value;
  const toDate = document.getElementById("ai-to-date").value;

  if (!email || !fromDate || !toDate) {
    showStatus("ai-status", "❌ Please fill in all fields", "error");
    return;
  }

  try {
    showSpinner("ai-status");
    const result = await apiCall("POST", "/api/ai/suggest-categories", {
      email,
      fromDate,
      toDate,
    });

    // Parse the AI response
    try {
      // The response might be a string with JSON objects
      const lines = result.split("\n").filter((line) => line.trim());
      aiSuggestedRules = [];
      const categoryMap = {};

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.transactionId && parsed.category) {
            const desc = parsed.description || parsed.transactionId;
            if (!categoryMap[desc]) {
              categoryMap[desc] = parsed.category;
              aiSuggestedRules.push({
                match: desc.toLowerCase(),
                category: parsed.category,
              });
            }
          }
        } catch (e) {
          // Single JSON object
          if (result.transactionId && result.category) {
            const desc = result.description || result.transactionId;
            if (!categoryMap[desc]) {
              categoryMap[desc] = result.category;
              aiSuggestedRules.push({
                match: desc.toLowerCase(),
                category: result.category,
              });
            }
          }
        }
      }

      // Display suggestions
      const output = document.getElementById("ai-output");
      output.textContent = JSON.stringify(aiSuggestedRules, null, 2);
      output.classList.remove("hidden");

      showStatus(
        "ai-status",
        `✅ Found ${aiSuggestedRules.length} category suggestion(s)!`,
        "success"
      );

      // Enable apply button
      document.getElementById("ai-apply-btn").disabled = false;
    } catch (parseError) {
      showStatus(
        "ai-status",
        `✅ AI response received. Raw output displayed below.`,
        "success"
      );
      const output = document.getElementById("ai-output");
      output.textContent = JSON.stringify(result, null, 2);
      output.classList.remove("hidden");
    }
  } catch (error) {
    showStatus("ai-status", `❌ Error: ${error.message}`, "error");
  }
}

async function aiApplyRules() {
  if (aiSuggestedRules.length === 0) {
    showStatus("ai-status", "❌ No rules to apply", "error");
    return;
  }

  if (!confirm(`Apply ${aiSuggestedRules.length} category rules?`)) {
    return;
  }

  try {
    showSpinner("ai-status");

    // Add each rule
    for (const rule of aiSuggestedRules) {
      await apiCall("POST", "/api/categories/rules", {
        matchText: rule.match,
        category: rule.category,
      });
    }

    showStatus(
      "ai-status",
      `✅ Applied ${aiSuggestedRules.length} rule(s) successfully!`,
      "success"
    );

    // Clear suggestions
    aiSuggestedRules = [];
    document.getElementById("ai-apply-btn").disabled = true;
    document.getElementById("ai-output").classList.add("hidden");
  } catch (error) {
    showStatus("ai-status", `❌ Error: ${error.message}`, "error");
  }
}

// Reconsent
let reconsentUrl = null;

async function checkReconsent() {
  const email = document.getElementById("reconsent-email").value.trim();

  if (!email) {
    showStatus("reconsent-status", "❌ Please enter your email", "error");
    return;
  }

  try {
    showSpinner("reconsent-status");
    const result = await apiCall(
      "GET",
      `/api/reconsent/check/${encodeURIComponent(email)}`
    );

    if (result.expired || result.needsReconsent) {
      reconsentUrl = result.reconsentLink || result.reconsentUrl;
      if (reconsentUrl) {
        showStatus(
          "reconsent-status",
          "⚠️ Bank consent expired. Click button to reconsent.",
          "error"
        );
        document.getElementById("open-reconsent-btn").disabled = false;
      } else {
        showStatus(
          "reconsent-status",
          "⚠️ Consent may be expired but no reconsent link available",
          "error"
        );
      }
    } else {
      showStatus(
        "reconsent-status",
        "✅ All bank connections are active!",
        "success"
      );
      document.getElementById("open-reconsent-btn").disabled = true;
    }
  } catch (error) {
    showStatus("reconsent-status", `❌ Error: ${error.message}`, "error");
  }
}

function openReconsent() {
  if (reconsentUrl) {
    window.open(reconsentUrl, "_blank");
  } else {
    showStatus("reconsent-status", "❌ No reconsent URL available", "error");
  }
}

// Check login status on page load
async function checkLoginStatus() {
  try {
    const status = await apiCall("GET", "/api/token/status");

    if (status.hasToken) {
      // User is already logged in
      document.getElementById("login-card").classList.add("hidden");
      document.getElementById("logged-in-card").classList.remove("hidden");
      document.getElementById("logged-in-email").textContent =
        status.email || "Logged in";
    } else {
      // User needs to log in
      document.getElementById("login-card").classList.remove("hidden");
      document.getElementById("logged-in-card").classList.add("hidden");
    }
  } catch (error) {
    console.error("Error checking login status:", error);
  }
}

// Set default dates on load
window.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split("T")[0];
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  document.getElementById("from-date").value = threeDaysAgo
    .toISOString()
    .split("T")[0];
  document.getElementById("to-date").value = today;

  // Set AI dates
  document.getElementById("ai-from-date").value = threeDaysAgo
    .toISOString()
    .split("T")[0];
  document.getElementById("ai-to-date").value = today;

  // Check if user is already logged in
  checkLoginStatus();
});
