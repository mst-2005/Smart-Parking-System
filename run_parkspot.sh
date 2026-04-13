#!/bin/bash

# ParkSpot+ Startup Script
# This script starts the Backend, AI Server, and Frontend concurrently.

# Set the path to include common binary locations
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

# --- Cloud Detection ---
IS_GCP=false
if curl -s -m 1 -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/id > /dev/null; then
    IS_GCP=true
    PUBLIC_IP=$(curl -s -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip)
fi

echo "--------------------------------------------------"
echo "🚀 Initializing ParkSpot+ Ecosystem..."
if [ "$IS_GCP" = true ]; then
    echo "☁️ Environment: Google Cloud Platform"
    echo "🌍 Public IP: $PUBLIC_IP"
else
    echo "💻 Environment: Local MacBook"
fi
echo "--------------------------------------------------"

# 0. Handle Google Drive Mounting (GCP only)
if [ "$IS_GCP" = true ]; then
    if ! mountpoint -q ~/google-drive; then
        echo "☁️ Mounting Google Drive storage..."
        rclone mount gdrive: ~/google-drive --vfs-cache-mode writes --daemon 2>/dev/null
        sleep 2
    fi
fi

# Function to clean up background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $AI_PID
    if [ "$IS_GCP" = true ]; then
        # On Cloud, we might want to keep the mount but stop the app
        echo "💡 Tip: run 'fusermount -u ~/google-drive' if you wish to unmount storage."
    fi
    exit
}

# Trap SIGINT (Ctrl+C) to run the cleanup function
trap cleanup SIGINT

# Check and install backend dependencies
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Backend node_modules not found. Installing..."
    cd backend && npm install && cd ..
fi

# 1. Start Main Backend
echo "📡 [1/3] Starting Main Backend (Port 3001)..."
cd backend
node index.js > server.log 2>&1 &
BACKEND_PID=$!
cd ..

# Check and install Python dependencies
if [ ! -d "backend/ensemble-predict-occupancy/venv" ]; then
    echo "🐍 Python venv not found. Creating and installing dependencies..."
    cd backend/ensemble-predict-occupancy
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ../..
fi

# 2. Start AI Ensemble Server
echo "🧠 [2/3] Starting AI Ensemble Server (Port 8000)..."
cd backend/ensemble-predict-occupancy
# Activate virtual environment to ensure all dependencies are accessible
source venv/bin/activate
python3 index.py > ai_server.log 2>&1 &
AI_PID=$!
cd ../..

# Wait a moment for backends to initialize
sleep 2

# 3. Start Frontend
echo "💻 [3/3] Launching Frontend (Port 5173)..."
echo "--------------------------------------------------"
echo "✅ Backend & AI Server are running in the background."
if [ "$IS_GCP" = true ]; then
    echo "✅ Access Frontend at: http://$PUBLIC_IP:5173"
else
    echo "✅ Access Frontend at: http://localhost:5173"
    echo "🌐 Launching Google Chrome without password warnings..."
    # Opens a new Chrome tab/window with password leak detection disabled
    open -a "Google Chrome" "http://localhost:5173" --args --disable-features=PasswordLeakDetection
fi
echo "💡 Press Ctrl+C to stop all servers."
echo "--------------------------------------------------"
cd frontend

# Check and install frontend dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Frontend node_modules not found. Installing..."
    npm install
fi

npm run dev
