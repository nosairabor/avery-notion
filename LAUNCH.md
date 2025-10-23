# 🚀 How to Launch Avery Notion Sync (Standalone)

## What You Have

A **fully standalone Node.js application** that syncs Avery transactions to Notion without any dependency on Google Apps Script or Google infrastructure.

---

## 🎯 Launch Options

### Option 1: Quick Start (Recommended)

**On Mac/Linux:**

```bash
cd avery-notion-sync-standalone
./start.sh
```

**On Windows:**

```cmd
cd avery-notion-sync-standalone
start.bat
```

This will:

- ✅ Install dependencies if needed
- ✅ Create `.env` file if missing
- ✅ Create `data/` directory
- ✅ Start the server

### Option 2: Manual Setup

```bash
cd avery-notion-sync-standalone

# 1. Install dependencies
npm install

# 2. Create environment file
echo "PORT=3000
AVERY_BASE_URL=https://app.averyapp.ai
NODE_ENV=development" > .env

# 3. Create data directory
mkdir -p data

# 4. Start server
npm start
```

### Option 3: One-Line Install & Run

```bash
cd avery-notion-sync-standalone && ./install.sh && npm start
```

---

## 📱 Access the Application

Once the server is running, open your browser to:

```
http://localhost:3000
```

You should see the Avery Notion Sync interface!

---

## 🔧 Configuration Steps in the UI

### 1. Save Your Avery Token

- Go to https://app.averyapp.ai
- Get your user token
- Paste it in the first input field
- Click "Save Token"

### 2. Connect Notion

- Click "Connect Notion Account"
- A popup opens for Notion OAuth
- Authorize the connection
- Wait for success message

### 3. Select Parent Page

- Search for a page in your Notion workspace
- This is where your transactions database will be created
- Click the page to select it

### 4. Create Database

- Click "Create 'Avery Transactions' Database"
- A new database is created in the selected page

### 5. Sync Transactions

- Enter your Avery email address
- Set date range (defaults to last 3 days)
- Click "Run Sync"
- Transactions will be imported!

---

## 🌐 Running on Notion (Deployment)

The application runs as a **web service**, not directly on Notion. However, it syncs **to** Notion. Here are your deployment options:

### Local Deployment (Your Computer)

**Keep it running 24/7 with PM2:**

```bash
npm install -g pm2
pm2 start server.js --name avery-notion-sync
pm2 save
pm2 startup  # Auto-start on system boot
```

### Cloud Deployment (Recommended for 24/7 access)

#### Option A: Heroku (Free tier available)

```bash
# Install Heroku CLI first
heroku create avery-notion-sync
git init
git add .
git commit -m "Initial commit"
git push heroku main
heroku open
```

#### Option B: Railway (Easy, modern)

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Connect your repo
4. Railway auto-detects Node.js
5. Get your public URL

#### Option C: Render (Free tier)

1. Go to https://render.com
2. Create new "Web Service"
3. Connect GitHub repo
4. Build command: `npm install`
5. Start command: `npm start`
6. Get your public URL

#### Option D: DigitalOcean App Platform

1. Go to DigitalOcean
2. Create new App
3. Connect repo
4. Auto-deploys

#### Option E: Your Own Server (VPS)

```bash
# SSH into your server
git clone <your-repo>
cd avery-notion-sync-standalone
npm install
pm2 start server.js
```

### Access from Anywhere

Once deployed to cloud, you get a public URL like:

- `https://your-app.herokuapp.com`
- `https://your-app.railway.app`
- `https://your-app.onrender.com`

You can access this from any device!

---

## 🔄 Automated Sync

### Option 1: Use Cron (on server)

Add to your crontab:

```bash
# Sync every hour
0 * * * * curl -X POST http://localhost:3000/api/notion/sync -H "Content-Type: application/json" -d '{"email":"you@example.com"}'
```

### Option 2: Use Node-Cron (in the app)

Add to `server.js`:

```javascript
const cron = require("node-cron");

// Run sync every hour
cron.schedule("0 * * * *", async () => {
  console.log("Running scheduled sync...");
  // Add your sync logic
});
```

### Option 3: External Scheduler

Use services like:

- **Cron-job.org**: Free web-based cron
- **EasyCron**: Cloud cron service
- **GitHub Actions**: Run on schedule

---

## 📊 How It Works

```
┌─────────────┐
│  Your       │
│  Browser    │
└──────┬──────┘
       │
       │ (HTTP)
       │
┌──────▼──────────────────┐
│  Node.js Server         │
│  (localhost:3000)       │
│                         │
│  ┌──────────────────┐   │
│  │ Express API      │   │
│  │ - /api/token     │   │
│  │ - /api/notion/*  │   │
│  │ - /api/sync      │   │
│  └──────────────────┘   │
│                         │
│  ┌──────────────────┐   │
│  │ Storage          │   │
│  │ data/config.json │   │
│  └──────────────────┘   │
└──────┬──────────┬───────┘
       │          │
       │          │
┌──────▼──────┐  ┌▼──────────────┐
│ Avery API   │  │ Notion API    │
│ (OAuth)     │  │ (Transactions)│
└─────────────┘  └───────────────┘
```

---

## 🎨 Customization

### Change Port

Edit `.env`:

```env
PORT=8080
```

### Change Avery API URL

Edit `.env`:

```env
AVERY_BASE_URL=https://your-custom-api.com
```

### Add Authentication

Add to `server.js`:

```javascript
app.use((req, res, next) => {
  const auth = req.headers.authorization;
  if (auth !== "Bearer YOUR_SECRET_TOKEN") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});
```

---

## 🐛 Common Issues

### Issue: "EADDRINUSE: Port 3000 already in use"

**Solution:** Change `PORT` in `.env` or kill the process:

```bash
lsof -ti:3000 | xargs kill
```

### Issue: "Cannot find module 'express'"

**Solution:** Install dependencies:

```bash
npm install
```

### Issue: OAuth popup blocked

**Solution:** Allow popups for localhost in browser settings

### Issue: "Notion access token unavailable"

**Solution:**

1. Complete OAuth flow first
2. Check Avery token is saved
3. Verify Avery API is accessible

---

## 📈 Monitoring

View logs in real-time:

```bash
# If using npm start
# Logs are in the terminal

# If using PM2
pm2 logs avery-notion-sync

# If using systemd
journalctl -u avery-notion-sync -f
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` or `data/` to git** (already in `.gitignore`)
2. **Use HTTPS in production** (most hosting platforms provide this)
3. **Add authentication** if exposing publicly
4. **Rotate tokens regularly**
5. **Use environment variables** for sensitive data

---

## 📚 Additional Resources

- **Full README**: See `README.md` for detailed documentation
- **Quick Start**: See `QUICKSTART.md` for condensed instructions
- **Notion API Docs**: https://developers.notion.com
- **Express.js Docs**: https://expressjs.com

---

## ✅ Success Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created
- [ ] Server starts without errors
- [ ] Can access http://localhost:3000
- [ ] Avery token saved
- [ ] Notion OAuth completed
- [ ] Database created in Notion
- [ ] First sync successful

---

## 🎉 You're All Set!

Your standalone Avery Notion Sync is ready. It runs independently as a Node.js service and syncs to Notion via API.

**Need help?** Check the logs, README, or open an issue!

---

**Happy Syncing!** 🚀✨

