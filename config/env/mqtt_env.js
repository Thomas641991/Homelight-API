const mqtt = require('mqtt');
const mqttIP = 'mqtt://127.0.0.1:1883';
const mqttSettings = {
	keepalive: 1000,
	clientId: "HomeLight-API",
	username: "",
	password: ""
};

module.exports = {
	mqtt: mqtt,
	mqttIP: mqttIP,
	mqttSettings: mqttSettings
}
