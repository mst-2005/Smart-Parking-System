#!/bin/bash

# ParkSpot+ Google Cloud Provisioning Script
# Use this on a fresh Ubuntu 22.04 LTS VM

echo "--------------------------------------------------"
echo "🚀 Starting ParkSpot+ Cloud Provisioning..."
echo "--------------------------------------------------"

# 1. Update & Build Essentials
sudo apt-get update
sudo apt-get install -y build-essential curl git wget fuse3

# 2. Install Node.js 20
echo "🟢 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install Python 3.10 & AI Dependencies
echo "🐍 Installing Python & AI Tooling..."
sudo apt-get install -y python3-pip python3-venv
# Note: Specific AI libraries will be installed via requirements.txt in the app folder

# 4. Install rclone (for Google Drive)
echo "☁️ Installing rclone..."
sudo -v ; curl https://rclone.org/install.sh | sudo bash

# 5. Install PM2 (Process Manager for 24/7 Uptime)
echo "🔄 Installing PM2..."
sudo npm install -g pm2

# 6. Prepare Application Directory
mkdir -p ~/parkspot
mkdir -p ~/google-drive

echo "--------------------------------------------------"
echo "✅ Provisioning Complete!"
echo "--------------------------------------------------"
echo "Next Steps:"
echo "1. Run 'rclone config' to link your Google Drive."
echo "2. Clone your repository into ~/parkspot."
echo "3. Run 'npm install' and 'pip install' in respective folders."
echo "--------------------------------------------------"
