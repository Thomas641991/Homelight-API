#! /bin/bash
# Install script for HomeLight API

cd ~/.

#Update and upgrade
sudo apt update
sudo apt upgrade -y

#Install GIT
sudo apt-get install git

# Install Node.JS
echo "Installing Node.JS"
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install build-tools
echo "Installing Build-Tools"
sudo apt-get install -y build-essential

#install MongoDB (We need a 64-bit OS for this, Raspbian will not run this properly)
curl -s https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -
echo "deb [ arch=arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.2.list
sudo apt update
sudo apt install mongodb-org
sudo systemctl enable mongod
sudo systemctl start mongod

# Install MQTT
echo "Installing MQTT"
sudo apt install -y mosquitto mosquitto-clients
sudo systemctl enable mosquitto.service

# Install API
echo "Installing API"
cd Homelight-API/
sudo npm install --save
chmod +x ./server.js
chmod +x ./install.sh
chmod +x ./update.sh

# Copy homelight-api.service to boot at start
echo "Copy Homelight-API.service"
sudo cp homelight-api.service /etc/systemd/system/
sudo systemctl daemon-reload

# start service
echo "Start service"
sudo systemctl start homelight-api
sudo systemctl enable homelight-api
