@echo off
REM Start script for Windows

echo Starting Avery Notion Sync...
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Dependencies not installed. Running installation...
    call npm install
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo .env file not found. Creating from example...
    (
        echo PORT=3000
        echo AVERY_BASE_URL=https://app.averyapp.ai
        echo NODE_ENV=development
    ) > .env
    echo .env file created
    echo.
)

REM Create data directory if it doesn't exist
if not exist "data\" mkdir data

REM Start the server
echo Server starting on http://localhost:3000
echo Press Ctrl+C to stop
echo.

node server.js


