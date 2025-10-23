#!/bin/bash

# Start script for Unix/Mac/Linux

echo "🚀 Starting Avery Notion Sync..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  Dependencies not installed. Running installation..."
    npm install
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cat > .env << EOF
PORT=3000
AVERY_BASE_URL=https://app.averyapp.ai
NODE_ENV=development
EOF
    echo "✅ .env file created"
    echo ""
fi

# Create data directory if it doesn't exist
mkdir -p data

# Start the server
echo "🌐 Server starting on http://localhost:3000"
echo "   Press Ctrl+C to stop"
echo ""

node server.js


