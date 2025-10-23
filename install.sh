#!/bin/bash

echo "🚀 Installing Avery Notion Sync (Standalone)"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cat > .env << EOF
PORT=3000
AVERY_BASE_URL=https://app.averyapp.ai
NODE_ENV=development
EOF
    echo "✅ .env file created"
fi

# Create data directory
if [ ! -d data ]; then
    echo ""
    echo "📁 Creating data directory..."
    mkdir -p data
    echo "✅ data directory created"
fi

echo ""
echo "✨ Installation complete!"
echo ""
echo "To start the server:"
echo "  npm start"
echo ""
echo "Then open your browser to:"
echo "  http://localhost:3000"
echo ""


