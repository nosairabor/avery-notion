const fs = require("fs");
const path = require("path");

const STORAGE_DIR = path.join(__dirname, "..", "data");
const STORAGE_FILE = path.join(STORAGE_DIR, "config.json");

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

function readStorage() {
  if (!fs.existsSync(STORAGE_FILE)) {
    return {};
  }

  try {
    const data = fs.readFileSync(STORAGE_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading storage:", error);
    return {};
  }
}

function writeStorage(data) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing storage:", error);
    throw error;
  }
}

function saveUserToken(token) {
  const data = readStorage();
  if (token) {
    data.AVERY_USER_TOKEN = token;
  } else {
    delete data.AVERY_USER_TOKEN;
  }
  writeStorage(data);
  return true;
}

function getUserToken() {
  const data = readStorage();
  return data.AVERY_USER_TOKEN || "";
}

function setUserEmail(email) {
  const data = readStorage();
  if (email) {
    data.USER_EMAIL = email;
  } else {
    delete data.USER_EMAIL;
  }
  writeStorage(data);
}

function getUserEmail() {
  const data = readStorage();
  return data.USER_EMAIL || null;
}

function setNotionDatabaseId(databaseId) {
  const data = readStorage();
  data.NOTION_DATABASE_ID = databaseId;
  writeStorage(data);
}

function getNotionDatabaseId() {
  const data = readStorage();
  return data.NOTION_DATABASE_ID || null;
}

function saveCategoryRule(matchText, category) {
  const data = readStorage();
  const rules = data.CATEGORY_RULES || [];
  rules.push({ match: matchText.toLowerCase(), category });
  data.CATEGORY_RULES = rules;
  writeStorage(data);
  return rules;
}

function listCategoryRules() {
  const data = readStorage();
  return data.CATEGORY_RULES || [];
}

function resetCategoryRules() {
  const data = readStorage();
  data.CATEGORY_RULES = [];
  writeStorage(data);
  return [];
}

function setAutosyncSettings(settings) {
  const data = readStorage();
  data.AUTOSYNC_SETTINGS = settings;
  writeStorage(data);
  return settings;
}

function getAutosyncSettings() {
  const data = readStorage();
  return data.AUTOSYNC_SETTINGS || null;
}

function setNotionAccessToken(token) {
  const data = readStorage();
  if (token) {
    data.NOTION_ACCESS_TOKEN = token;
  } else {
    delete data.NOTION_ACCESS_TOKEN;
  }
  writeStorage(data);
}

function getNotionAccessToken() {
  const data = readStorage();
  return data.NOTION_ACCESS_TOKEN || null;
}

function reset() {
  writeStorage({});
}

function getStoragePath() {
  return STORAGE_FILE;
}

module.exports = {
  saveUserToken,
  getUserToken,
  setUserEmail,
  getUserEmail,
  setNotionDatabaseId,
  getNotionDatabaseId,
  setNotionAccessToken,
  getNotionAccessToken,
  saveCategoryRule,
  listCategoryRules,
  resetCategoryRules,
  setAutosyncSettings,
  getAutosyncSettings,
  reset,
  getStoragePath,
};
