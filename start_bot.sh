#!/bin/bash

echo "===================================="
echo "   Starting Meeting Bot"
echo "===================================="
echo ""

# Check if .env exists
if [ ! -f bot_engine/.env ]; then
    echo "ERROR: Configuration file not found!"
    echo "Please run setup_bot.sh first and configure bot_engine/.env"
    exit 1
fi

# Check if node_modules exists
if [ ! -d bot_engine/node_modules ]; then
    echo "ERROR: Dependencies not installed!"
    echo "Please run setup_bot.sh first"
    exit 1
fi

echo "Starting bot..."
echo "Press Ctrl+C to stop the bot"
echo ""

cd bot_engine
node bot_engine.js
