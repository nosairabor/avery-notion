# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install

```bash
cd avery-notion-sync-standalone
./install.sh
```

Or manually:

```bash
npm install
cp .env.example .env
mkdir -p data
```

### 2. Start Server

```bash
npm start
```

You should see:

```
✅ Avery Notion Sync server running on http://localhost:3000
📊 Storage location: /path/to/data/config.json
```

### 3. Open Browser

Navigate to: **http://localhost:3000**

---

## 📋 Setup Workflow

Follow these steps in the web interface:

1. **🔑 Configure Token**

   - Get your Avery user token from https://app.averyapp.ai
   - Paste it in the first box
   - Click "Save Token"

2. **🔗 Connect Notion**

   - Click "Connect Notion Account"
   - Authorize in popup window
   - Wait for "Connected successfully!"

3. **📄 Choose Page**

   - Search for a parent page in Notion
   - Click to select it

4. **📊 Create Database**

   - Click "Create 'Avery Transactions' Database"
   - Database will be created in selected page

5. **🔄 Sync Transactions**
   - Enter your Avery email
   - Set date range (optional)
   - Click "Run Sync"

---

## 💡 Tips

- **Default sync range**: Last 3 days to today
- **Auto-categorization**: Add rules in "Additional Features"
- **Multiple syncs**: You can run sync multiple times safely (it upserts by Transaction ID)
- **View progress**: Check the Notion database directly to see transactions appear

---

## 🐛 Troubleshooting

| Problem                   | Solution                                       |
| ------------------------- | ---------------------------------------------- |
| Port 3000 in use          | Change `PORT` in `.env` to 3001, 3002, etc.    |
| "Token unavailable"       | Make sure you saved your Avery token in step 1 |
| "Database not configured" | Complete steps 1-4 before syncing              |
| OAuth popup blocked       | Allow popups for localhost in browser settings |

---

## 📁 Project Structure

```
avery-notion-sync-standalone/
├── 📄 server.js           → Main Express server
├── 📂 src/                → Backend logic
│   ├── avery-client.js    → Talks to Avery API
│   ├── notion-client.js   → Talks to Notion API
│   ├── sync.js            → Syncs transactions
│   └── storage.js         → Saves config
├── 📂 public/             → Frontend
│   ├── index.html         → Web interface
│   └── app.js             → UI logic
└── 📂 data/               → Your data
    └── config.json        → Stored configuration
```

---

## 🌐 Deployment Options

### Option 1: Keep Running Locally

```bash
# Using PM2 (recommended)
npm install -g pm2
pm2 start server.js --name avery-sync
pm2 save
```

### Option 2: Deploy to Cloud

**Heroku:**

```bash
heroku create your-app-name
git push heroku main
```

**Railway:**

1. Connect GitHub repo
2. Deploy automatically

**Render:**

1. Connect GitHub repo
2. Set build command: `npm install`
3. Set start command: `npm start`

---

## 🔒 Security Notes

- **Local only**: Data stored locally in `data/config.json`
- **Token safety**: Never commit `.env` or `data/` to git
- **OAuth**: Uses Avery API as OAuth broker (no direct Notion credentials stored)

---

## 📞 Need Help?

- **Check logs**: Server output shows detailed error messages
- **Notion API**: https://developers.notion.com
- **Avery support**: Contact via Avery app

---

## ⚡️ Development Mode

```bash
npm run dev  # Auto-restarts on file changes
```

---

Happy syncing! 🎉

