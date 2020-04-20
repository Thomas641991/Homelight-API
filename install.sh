#! /bin/bash
# Install script for HomeLight API

cd ~/.

# Install Node.JS
echo "Installing Node.JS"
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install build-tools
echo "Installing Build-Tools"
sudo apt-get install -y build-essential

# Install MQTT
echo "Installing MQTT"
sudo apt install -y mosquitto mosquitto-clients
sudo systemctl enable mosquitto.service

# Install API
echo "Installing API"
cd Homelight-API/
sudo npm install --save
chmod +x ~/server.js

# Copy homelight-api.service to boot at start
echo "Copy Homelight-API.service"
sudo cp homelight-api.service ../../../etc/systemd/system/

# start service
echo "Start service"
sudo systemctl enable homelight-api.service
