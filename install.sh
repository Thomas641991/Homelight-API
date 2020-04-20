#! /bin/bash
# Install script for HomeLight API

cd ~/.

# Install Node.JS
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install build-tools
sudo apt-get install -y build-essential

sudo apt install mosquitto mosquitto-clients
sudo systemctl enable mosquitto

# Install MQTT
sudo apt install -y mosquitto mosquitto-clients
sudo systemctl enable mosquitto.service

# Download and install API
cd Homelight-API/
sudo npm install --save
chmod +x ~/server.js
cd ../

# Copy homelight-api.service to boot at start
sudo cp homelight-api.service ../../etc/systemd/system/

# start service
sudo systemctl enable homelight-api.service
