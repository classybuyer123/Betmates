#!/bin/bash

# BetMates Expo Auto-Start Script
# This script automatically starts Expo in tunnel mode when the codespace starts

echo "🚀 Starting BetMates Expo Development Server..."

# Navigate to project directory
cd /workspaces/BetMates

# Ensure we're using Node 20
echo "📦 Setting up Node.js 20..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20 > /dev/null 2>&1 || (nvm install 20 && nvm use 20)
nvm alias default 20

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --legacy-peer-deps
fi

# Clear any existing Expo cache
echo "🧹 Clearing Expo cache..."
npx expo install --fix > /dev/null 2>&1

# Start Expo in tunnel mode
echo "🌐 Starting Expo tunnel..."
echo "📱 Your app will be available via QR code!"
echo "💡 The tunnel URL will be displayed below:"
echo ""

npx expo start --tunnel --non-interactive
