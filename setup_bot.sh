#!/bin/bash

echo "===================================="
echo "   Meeting Bot Setup Script"
echo "===================================="
echo ""

cd bot_engine

echo "[1/3] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo "Node.js is installed: $(node --version)"
echo ""

echo "[2/3] Installing bot dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi
echo ""

echo "[3/3] Setting up configuration..."
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo ""
    echo "IMPORTANT: Please edit bot_engine/.env file with your credentials:"
    echo "  - GOOGLE_EMAIL: Bot's Google account"
    echo "  - GOOGLE_PASSWORD: Bot's password"
    echo "  - MEETING_URL: Google Meet URL to join"
    echo ""
else
    echo ".env file already exists, skipping..."
fi

echo "===================================="
echo "   Setup Complete!"
echo "===================================="
echo ""
echo "Next steps:"
echo "1. Edit bot_engine/.env with your Google account credentials"
echo "2. Set the MEETING_URL in bot_engine/.env"
echo "3. Start the backend: python backend/main.py"
echo "4. Run the bot: cd bot_engine && npm start"
echo ""
