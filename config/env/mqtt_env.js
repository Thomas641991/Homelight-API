const mqtt = require('mqtt');

// local MQTT server address and port
const mqttPort = 1883;
const mqttIP = `mqtt://127.0.0.1:${mqttPort}`;
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
