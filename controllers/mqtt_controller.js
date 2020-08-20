const mqtt_env = require('../config/env/mqtt_env');
const DeviceMessageController = require('./device_message_controller');
const GroupMessageController = require('./group_message_controller');

let mqttClient = null;

module.exports = {

    // Setting up MQTT server
    setupMQTT() {
        console.log(`Connecting to MQTT server at ${mqtt_env.mqttIP}`)
        mqttClient = mqtt_env.mqtt.connect(mqtt_env.mqttIP, mqtt_env.mqttSettings);

        mqttClient.on('connect', () => {
            mqttClient.subscribe(['newDevice', 'device/#', 'group/#']);
            console.log('Successfully connected to MQTT');
        });

        mqttClient.on('message', callbackForMessage);

        mqttClient.on('error', () => {
            console.error("Error");
        })
    },

    publishMessage(topic, message) {
        if (mqttClient !== null || mqttClient) {
            mqttClient.publish(topic, message);
        }
    }
};

// TODO: Add functionality for handling incoming messages
function callbackForMessage(topic, message) {
    console.log(topic + ': ' + message);

    switch (topic) {
        // Device topics
        case 'device/power_state_set':
            DeviceMessageController.powerStateSet(JSON.parse(message));
            break;
		case 'device/device_id_set':
			DeviceMessageController.deviceIdSet(JSON.parse(message));
			break;
        case 'device/device_name_set':
            DeviceMessageController.deviceNameSet(JSON.parse(message));
            break;
        case 'device/device_group_set':
            DeviceMessageController.groupIdSet(JSON.parse(message));
            break;

        // Group topics
        case 'group/#':
            GroupMessageController.handleMessage(topic, message);
            break;
    }
}
