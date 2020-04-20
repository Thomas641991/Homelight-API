const mqtt_env = require('../config/env/mqtt_env');

let mqttClient = null;

module.exports = {
	setupMQTT() {
		mqttClient = mqtt_env.mqtt.connect(mqtt_env.mqttIP, mqtt_env.mqttSettings);
		
		mqttClient.on('connect', () => {
			mqttClient.subscribe('newDevice');
			console.log('Succesfully connected to MQTT');
		});
		
		mqttClient.on('message', callbackForMessage);
		
		mqttClient.on('error', () => {
			console.log("Error");
		})
	},
	
	publishMessage(topic, message) {
		if (mqttClient !== null || mqttClient !== undefined) {
			mqttClient.publish(topic, message);
		}
	}
};

function callbackForMessage(topic, message) {
	console.log(topic + ': ' + message);
}
