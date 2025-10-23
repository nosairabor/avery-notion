# Quick Start: Notion OAuth Setup

## ✅ What's Been Implemented

Your standalone app now connects **directly** to Notion using OAuth 2.0, without needing the Avery API for Notion integration.

### Changes Made:

1. **Direct Notion OAuth** - Connects straight to Notion API
2. **Email-only authentication** with Avery (for transactions)
3. **Local token storage** - Notion access token saved in `data/config.json`
4. **Automatic callback handling** - OAuth flow completes automatically

## 🚀 How to Use

### 1. Create Notion Integration (5 minutes)

Visit: https://www.notion.so/my-integrations

1. Click "+ New integration"
2. Name it: "Avery Notion Sync"
3. Select your workspace
4. Click "Submit"
5. **Copy** the "OAuth client ID"
6. **Copy** the "OAuth client secret"
7. Under "Redirect URIs", add: `http://localhost:3003/api/notion/oauth/callback`
   (Update port if different)

### 2. Configure Your App

Create a file named `.env` in the project folder:

```bash
NOTION_CLIENT_ID=paste_your_client_id_here
NOTION_CLIENT_SECRET=paste_your_secret_here
NOTION_REDIRECT_URI=http://localhost:3003/api/notion/oauth/callback
PORT=3003
```

### 3. Start the Server

```bash
cd /Users/nosa/Desktop/avery-sheets-plugin/avery-notion-sync-standalone
npm start
```

### 4. Open in Browser

Go to: http://localhost:3003

1. **Login** with your email (e.g., brian@averyapp.ai)
2. Click **"Connect Notion Account"**
3. A popup opens → Click **"Select pages"**
4. Choose which pages the integration can access
5. Click **"Allow access"**
6. Done! The popup closes automatically

### 5. Sync Your Transactions

1. **Choose a parent page** where you want the database
2. Click **"Create Database"**
3. Select **date range** and **email**
4. Click **"Run Sync"**
5. Your transactions appear in Notion! 🎉

## 📁 Architecture

```
Your App (localhost:3003)
      ↓
  ┌─────────────────┐
  │  Email Login    │ → Avery API (for transactions)
  │  authkey header │
  └─────────────────┘
      ↓
  ┌─────────────────┐
  │  Notion OAuth   │ → Notion API (direct, no Avery)
  │  access_token   │
  └─────────────────┘
      ↓
  ┌─────────────────┐
  │  Local Storage  │ → data/config.json
  │  - Email        │
  │  - Notion Token │
  │  - Database ID  │
  └─────────────────┘
```

## 🔐 Security

- ✅ Notion OAuth access token stored locally
- ✅ `authkey` header for Avery API authentication
- ✅ No passwords or user tokens needed
- ✅ Email-based identification

## ❓ Troubleshooting

### "YOUR_NOTION_CLIENT_ID" appears in the OAuth URL

**Problem**: Environment variables not set.

**Solution**: Create the `.env` file as shown above and restart the server.

### "redirect_uri_mismatch"

**Problem**: The redirect URI doesn't match.

**Solution**: In Notion integration settings, make sure the redirect URI is EXACTLY:
`http://localhost:3003/api/notion/oauth/callback` (update port if different)

### Can't see my pages in Notion

**Problem**: Integration doesn't have access.

**Solution**:

1. Go to any Notion page
2. Click "..." → "Add connections"
3. Select your integration
4. Or share the page when prompted during sync

## 🎯 Next Steps

After connecting:

- Create your Notion database
- Run a sync to test
- Set up category rules
- Enable AI categorization

See `README.md` for full documentation!

## 🆘 Need Help?

Check `NOTION_SETUP.md` for detailed setup instructions.
