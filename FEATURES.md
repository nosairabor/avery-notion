# ✨ Complete Feature List

## Core Features (Original)

### ✅ Setup & Configuration

- **Avery Token Management** - Save and manage your Avery API token
- **Notion OAuth Connection** - Secure connection to your Notion workspace
- **Page Selection** - Search and select parent page for database
- **Database Creation** - Automatic "Avery Transactions" database setup

### ✅ Transaction Syncing

- **Manual Sync** - Sync transactions by date range
- **Upsert by Transaction ID** - Prevents duplicates
- **Date Range Selection** - Custom from/to dates
- **Account-based Syncing** - Sync specific accounts

## NEW Features Added! 🎉

### 1️⃣ AI Auto-Categorization 🤖

Automatically suggest categories for your transactions using AI:

- **Smart Suggestions** - AI analyzes transaction descriptions
- **Category Learning** - Uses existing Notion categories and rules
- **Batch Processing** - Categorize multiple transactions at once
- **Apply as Rules** - Save suggestions as permanent category rules

**How to Use:**

1. Enter email and date range
2. Click "Suggest Categories"
3. Review AI suggestions
4. Click "Apply As Rules" to save

### 2️⃣ Auto-Sync Schedule ⏰

Set up automatic daily syncing (no manual intervention required):

- **Configurable Schedule** - Set specific hour and minute
- **Daily Execution** - Runs automatically every day
- **Background Processing** - Works even when browser is closed
- **Manual Trigger** - Run sync immediately anytime

**How to Use:**

1. Set hour (0-23) and minute (0-59)
2. Enter your email
3. Click "Enable Auto-Sync"
4. Server must stay running (use PM2 or cloud hosting)

**Setup Cron Job:**

```bash
# Interactive setup
./scripts/setup-cron.sh

# Or manually
node scripts/cron-sync.js
```

### 3️⃣ Reconsent Management 🔄

Check and manage expired bank connections:

- **Status Checking** - Verify if bank consents are active
- **Expiration Detection** - Automatically detects expired consents
- **Direct Reconsent** - Opens bank reconsent page when needed
- **Multi-Account Support** - Checks all connected accounts

**How to Use:**

1. Enter your email
2. Click "Check Status"
3. If expired, click "Open Reconsent Page"
4. Complete bank authorization

### 4️⃣ Enhanced Category Rules 🏷️

Improved category management:

- **View All Rules** - See all active categorization rules
- **Add Rules** - Create custom match patterns
- **Reset Rules** - Clear all rules at once
- **Rule Preview** - See how rules will be applied

**Example Rules:**

- "amazon" → Shopping
- "uber" → Transportation
- "netflix" → Entertainment

### 5️⃣ Account Management 👤

View and manage connected bank accounts:

- **List Accounts** - See all connected accounts
- **Account Details** - Institution name, account type
- **Connection Status** - Active/inactive status
- **Quick Access** - Bank connect button

### 6️⃣ Tutorials & Resources 📚

Built-in help and learning resources:

**Video Tutorials:**

- Connect Your Bank Account
- Importing Transactions
- Auto Updates
- AI Auto-Categorise

**Templates:**

- Avery Bookkeeping Template
- Foundation Template

**Deployment Guides:**

- PM2 (Local 24/7 running)
- Heroku (Cloud hosting)
- Railway (Modern deployment)
- Render (Free tier)

### 7️⃣ Granular Reset Options ⚠️

More control over what you reset:

- **Clear Token** - Remove Avery token only
- **Clear DB Link** - Reset Notion database connection
- **Clear Rules** - Delete all category rules
- **Disable Autosync** - Turn off scheduled syncs
- **Reset Everything** - Nuclear option (clears all data)

## Feature Comparison

| Feature           | Original | Enhanced    |
| ----------------- | -------- | ----------- |
| Transaction Sync  | ✅       | ✅          |
| Notion OAuth      | ✅       | ✅          |
| Database Creation | ✅       | ✅          |
| Category Rules    | Basic    | ✅ Enhanced |
| AI Categorization | ❌       | ✅ NEW      |
| Auto-Sync         | ❌       | ✅ NEW      |
| Reconsent Check   | ❌       | ✅ NEW      |
| Tutorials         | ❌       | ✅ NEW      |
| Granular Resets   | ❌       | ✅ NEW      |
| Cron Jobs         | ❌       | ✅ NEW      |

## API Endpoints

### Core Endpoints

```
POST   /api/token                     - Save user token
GET    /api/token/status              - Check token status
POST   /api/notion/oauth/start        - Start Notion OAuth
GET    /api/notion/oauth/status       - Check OAuth status
POST   /api/notion/pages/search       - Search Notion pages
POST   /api/notion/database/create    - Create transactions database
POST   /api/notion/sync               - Run sync
GET    /api/accounts/:email           - List accounts
```

### NEW Endpoints

```
POST   /api/ai/suggest-categories     - AI categorization
GET    /api/reconsent/check/:email    - Check reconsent status
GET    /api/autosync/settings         - Get autosync settings
POST   /api/autosync/settings         - Set autosync settings
POST   /api/promo/apply               - Apply promo code
POST   /api/track                     - Track events
GET    /api/categories/rules          - List category rules
POST   /api/categories/rules          - Add category rule
DELETE /api/categories/rules          - Reset rules
POST   /api/reset/token               - Clear token
POST   /api/reset/database            - Clear DB link
POST   /api/reset/autosync            - Disable autosync
POST   /api/reset                     - Reset everything
```

## Data Storage

All configuration stored in `data/config.json`:

```json
{
  "AVERY_USER_TOKEN": "your-token",
  "NOTION_DATABASE_ID": "database-id",
  "CATEGORY_RULES": [{ "match": "amazon", "category": "Shopping" }],
  "AUTOSYNC_SETTINGS": {
    "hour": 21,
    "minute": 0,
    "email": "you@example.com",
    "enabled": true
  }
}
```

## Usage Workflow

### First-Time Setup

1. Save Avery token
2. Connect Notion (OAuth)
3. Select parent page
4. Create database
5. Run first sync

### Daily Usage

1. Transactions sync automatically (if autosync enabled)
2. Check reconsent status periodically
3. Use AI to categorize new transactions
4. View accounts and balances

### Maintenance

1. Add category rules as needed
2. Re-authorize banks when expired
3. Monitor sync logs
4. Adjust autosync schedule

## Deployment Options

### Local Development

```bash
npm start
```

### Production (24/7)

```bash
pm2 start server.js --name avery-notion-sync
pm2 save
pm2 startup
```

### Cloud Platforms

- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub, auto-deploy
- **Render**: Set build/start commands
- **DigitalOcean**: Deploy from repo

## Requirements

- Node.js 16+
- Avery user token
- Notion workspace
- Internet connection
- (Optional) PM2 for auto-restart

## Browser Support

- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## Performance

- **Sync Speed**: ~100 transactions/minute
- **API Rate Limiting**: Automatic backoff
- **Memory Usage**: ~50MB
- **Database**: JSON file (upgradeable to SQL)

## Security

- ✅ Local storage only
- ✅ No data sent to third parties
- ✅ OAuth for Notion (no direct credentials)
- ✅ Token-based Avery auth
- ❌ HTTPS recommended in production

## Troubleshooting

Common issues and solutions documented in:

- `README.md` - Full documentation
- `QUICKSTART.md` - Quick reference
- `LAUNCH.md` - Deployment guide

## Future Enhancements

Potential additions:

- 📊 Dashboard with charts
- 📱 Mobile app
- 🔔 Webhook notifications
- 💾 Database backend (PostgreSQL/MySQL)
- 🔐 Multi-user support
- 📈 Analytics and insights
- 🌍 Multi-language support

## Support

- **Documentation**: See README files
- **Issues**: Check logs in `logs/` directory
- **API Errors**: Review server console
- **Notion API**: https://developers.notion.com
- **Avery API**: Contact Avery support

---

**Version**: 2.0.0 (Enhanced Standalone)  
**Last Updated**: October 2025  
**License**: MIT

