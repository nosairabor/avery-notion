# Notion OAuth Setup Guide

This app requires you to create a Notion integration to connect to your Notion workspace.

## Step 1: Create a Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Click "+ New integration"
3. Fill in the details:
   - **Name**: Avery Notion Sync (or any name you prefer)
   - **Associated workspace**: Select your workspace
   - **Type**: Internal (for personal use) or Public (if sharing)
4. Click "Submit"

## Step 2: Get Your Credentials

After creating the integration, you'll see:

- **OAuth client ID**: Copy this
- **OAuth client secret**: Copy this

## Step 3: Configure Redirect URI

1. In your integration settings, scroll to "Redirect URIs"
2. Add: `http://localhost:3000/api/notion/oauth/callback`
   - If using a different port, replace `3000` with your port
   - If deploying online, use your domain: `https://yourdomain.com/api/notion/oauth/callback`
3. Click "Add URI"

## Step 4: Configure Environment Variables

### Option A: Using .env file (Recommended)

Create a `.env` file in the project root:

```bash
NOTION_CLIENT_ID=your_notion_client_id_here
NOTION_CLIENT_SECRET=your_notion_client_secret_here
NOTION_REDIRECT_URI=http://localhost:3000/api/notion/oauth/callback
PORT=3000
```

### Option B: Export in terminal

```bash
export NOTION_CLIENT_ID="your_notion_client_id_here"
export NOTION_CLIENT_SECRET="your_notion_client_secret_here"
export NOTION_REDIRECT_URI="http://localhost:3000/api/notion/oauth/callback"
```

## Step 5: Run the Server

```bash
npm start
```

## Step 6: Connect Your Notion

1. Open http://localhost:3000 in your browser
2. Login with your email
3. Click "Connect Notion Account"
4. Authorize the integration in the popup window
5. Done! You're connected to Notion

## Troubleshooting

### "OAuth Error" or "redirect_uri_mismatch"

**Problem**: The redirect URI in your .env doesn't match what's configured in Notion.

**Solution**: Make sure the redirect URI in your `.env` file EXACTLY matches what you added in the Notion integration settings.

### "Invalid client_id" or "Invalid client_secret"

**Problem**: The credentials are incorrect or not set.

**Solution**:

1. Double-check you copied the correct Client ID and Secret from Notion
2. Make sure there are no extra spaces or quotes
3. Restart the server after updating .env

### Connection works but can't see my pages

**Problem**: The integration doesn't have access to your pages.

**Solution**:

1. Open any Notion page you want to sync
2. Click the "..." menu → Add connections → Select your integration
3. Or when creating the database, share the parent page with the integration

## Security Notes

- **Never commit** `.env` file to git (it's in .gitignore)
- Keep your Client Secret private
- For production, use environment variables or a secrets manager
- The access token is stored locally in `data/config.json`

## Need Help?

Check the main README.md for more information or open an issue on GitHub.
