#!/bin/bash

# Setup Cron Job Script
# This script helps set up a cron job for automatic syncing

echo "🔧 Avery Notion Sync - Cron Setup"
echo "===================================="
echo ""

# Get the current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

echo "📁 Project directory: $PROJECT_DIR"
echo ""

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

echo "⏰ Choose sync frequency:"
echo "  1) Every hour"
echo "  2) Every 6 hours"
echo "  3) Daily at 9 PM"
echo "  4) Daily at specific time"
echo "  5) Custom cron expression"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
  1)
    CRON_EXPR="0 * * * *"
    CRON_DESC="every hour"
    ;;
  2)
    CRON_EXPR="0 */6 * * *"
    CRON_DESC="every 6 hours"
    ;;
  3)
    CRON_EXPR="0 21 * * *"
    CRON_DESC="daily at 9 PM"
    ;;
  4)
    read -p "Enter hour (0-23): " hour
    read -p "Enter minute (0-59): " minute
    CRON_EXPR="$minute $hour * * *"
    CRON_DESC="daily at $hour:$minute"
    ;;
  5)
    read -p "Enter cron expression: " CRON_EXPR
    CRON_DESC="custom schedule"
    ;;
  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "📋 Cron job configuration:"
echo "   Schedule: $CRON_DESC"
echo "   Expression: $CRON_EXPR"
echo "   Script: $PROJECT_DIR/scripts/cron-sync.js"
echo "   Logs: $PROJECT_DIR/logs/cron.log"
echo ""

# Generate cron entry
CRON_ENTRY="$CRON_EXPR cd $PROJECT_DIR && node scripts/cron-sync.js >> logs/cron.log 2>&1"

echo "⚠️  To add this cron job, run:"
echo ""
echo "   crontab -e"
echo ""
echo "Then add this line:"
echo ""
echo "   $CRON_ENTRY"
echo ""
echo "Or run this command to add it automatically:"
echo ""
echo "   (crontab -l 2>/dev/null; echo \"$CRON_ENTRY\") | crontab -"
echo ""

read -p "Add to crontab now? (y/n): " add_now

if [ "$add_now" = "y" ] || [ "$add_now" = "Y" ]; then
  (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
  echo ""
  echo "✅ Cron job added successfully!"
  echo ""
  echo "To view your cron jobs:"
  echo "   crontab -l"
  echo ""
  echo "To remove this cron job later:"
  echo "   crontab -e"
  echo "   (then delete the line)"
else
  echo ""
  echo "ℹ️  Cron job not added. You can add it manually later."
fi

echo ""
echo "📝 Note: Make sure your server is running for the cron job to work!"
echo "   Use PM2 to keep it running: pm2 start server.js"
echo ""


