# Avery Notion Sync - Standalone

A standalone Node.js web application to sync Avery transactions to a Notion database. No Google Apps Script required!

## Features

- ✅ **Standalone**: Runs independently as a Node.js server
- 🔐 **OAuth Integration**: Connects to Notion via Avery API OAuth
- 📊 **Transaction Sync**: Imports and upserts transactions by Transaction ID
- 🏷️ **Category Rules**: Define custom rules for auto-categorization
- 💾 **Simple Storage**: JSON file-based configuration (easily upgradeable to database)
- 🎨 **Modern UI**: Clean, responsive web interface

## Prerequisites

- Node.js 16+ installed
- Avery user token (get from Avery app)
- Notion workspace

## Quick Start

### 1. Install Dependencies

```bash
cd avery-notion-sync-standalone
npm install
```

### 2. Configure Environment

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` if needed:

```env
PORT=3000
AVERY_BASE_URL=https://app.averyapp.ai
NODE_ENV=development
```

### 3. Start the Server

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

### 4. Open the Web Interface

Open your browser to:

```
http://localhost:3000
```

## Usage

### Step-by-Step Setup

1. **Configure Avery Token**

   - Paste your Avery user token
   - Click "Save Token"

2. **Connect Notion**

   - Click "Connect Notion Account"
   - Authorize in the popup window
   - Wait for confirmation

3. **Choose Parent Page**

   - Search for a page in your Notion workspace
   - Click to select where the database will be created

4. **Create Database**

   - Click "Create 'Avery Transactions' Database"
   - A new database will be created in the selected page

5. **Sync Transactions**
   - Enter your Avery account email
   - Optionally set date range
   - Click "Run Sync"

### Additional Features

- **View Accounts**: List all connected bank accounts
- **Category Rules**: Create rules to auto-categorize transactions
- **Reset Configuration**: Clear all stored data and start over

## API Endpoints

The server exposes the following REST API endpoints:

### Configuration

- `POST /api/token` - Save Avery user token
- `GET /api/token/status` - Check token status

### Notion Integration

- `POST /api/notion/oauth/start` - Start Notion OAuth
- `GET /api/notion/oauth/status` - Check OAuth status
- `POST /api/notion/pages/search` - Search Notion pages
- `POST /api/notion/database/create` - Create transactions database
- `POST /api/notion/sync` - Run sync

### Avery API

- `GET /api/accounts/:email` - List user accounts
- `POST /api/promo/apply` - Apply promo code
- `POST /api/track` - Track events

### Category Rules

- `GET /api/categories/rules` - List rules
- `POST /api/categories/rules` - Add rule
- `DELETE /api/categories/rules` - Reset rules

### Utilities

- `POST /api/reset` - Reset all configuration

## Data Storage

Configuration is stored in `data/config.json`:

```json
{
  "AVERY_USER_TOKEN": "your-token",
  "NOTION_DATABASE_ID": "database-id",
  "CATEGORY_RULES": [{ "match": "amazon", "category": "Shopping" }]
}
```

## Architecture

```
avery-notion-sync-standalone/
├── server.js              # Express server & API routes
├── src/
│   ├── avery-client.js    # Avery API client
│   ├── notion-client.js   # Notion API client
│   ├── sync.js            # Sync logic & transaction mapping
│   ├── storage.js         # JSON file storage
│   ├── categorisation.js  # Category rules engine
│   ├── schema.js          # Notion database schema
│   └── utils.js           # Utilities (rate limiting, backoff)
├── public/
│   ├── index.html         # Web UI
│   └── app.js             # Frontend JavaScript
└── data/
    └── config.json        # Configuration storage
```

## Deployment

### Local Server

```bash
npm start
```

### Production Deployment

**Option 1: Heroku**

```bash
heroku create your-app-name
git push heroku main
```

**Option 2: Railway**

1. Connect your GitHub repo
2. Railway will auto-detect Node.js
3. Set environment variables in Railway dashboard

**Option 3: Docker**

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

**Option 4: PM2 (Production Process Manager)**

```bash
npm install -g pm2
pm2 start server.js --name avery-notion-sync
pm2 save
pm2 startup
```

## Environment Variables

| Variable         | Description        | Default                   |
| ---------------- | ------------------ | ------------------------- |
| `PORT`           | Server port        | `3000`                    |
| `AVERY_BASE_URL` | Avery API base URL | `https://app.averyapp.ai` |
| `NODE_ENV`       | Environment        | `development`             |

## Upgrading to Database

To use a real database instead of JSON files, modify `src/storage.js`:

**Example with SQLite:**

```javascript
const Database = require("better-sqlite3");
const db = new Database("data/config.db");

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
  )
`);

function saveUserToken(token) {
  const stmt = db.prepare(
    "INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)"
  );
  stmt.run("AVERY_USER_TOKEN", token);
}
```

## Troubleshooting

### "Notion access token unavailable"

- Make sure you've completed the OAuth flow
- Check that your Avery token is valid

### "Notion database not configured"

- Complete steps 1-3 before syncing
- Check that the database was created successfully

### Port already in use

- Change the PORT in `.env`
- Or kill the process: `lsof -ti:3000 | xargs kill`

## Contributing

Contributions welcome! Please open an issue or PR.

## License

MIT

## Support

For issues related to:

- **Avery API**: Contact Avery support
- **Notion API**: Check [Notion API docs](https://developers.notion.com)
- **This app**: Open a GitHub issue

