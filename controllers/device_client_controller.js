const Device = require('../models/device.model');
const DeviceEvent = require('../models/device_event.model');
const EventController = require('./event_controller');
const GroupController = require('./group_client_controller');
const MQTTHandler = require('./mqtt_controller');
const mongoose = require('mongoose');

let deviceArray = [];

module.exports = {
	
	// Ask all devices to give id, ip, name, groupId and powerState to check if already connected on boot
	searchForDevices() {
		MQTTHandler.publishMessage('all/', 'search_device');
	},
	
	// Endpoints
	
	// New device will be added in database and checked. After that a device added message will be published on MQTT for clients
	async addDevice(req, res, next) {
		let reqDeviceId = req.body._id;
		console.log("Id: " + reqDeviceId);
		
		let requestDevice = new Device({
			deviceIp: req.body.deviceIp,
			deviceName: req.body.deviceName,
			groupId: req.body.groupId,
			powerState: req.body.powerState
		});
		
		console.log(requestDevice);
		
		let deviceObj = await Device.findOne({deviceName: requestDevice.deviceName, deviceIp: requestDevice.deviceIp});
		if (deviceObj === null) {
			Device.create(requestDevice).then((device) => {
				console.log("New device: ");
				console.log(device);
				DeviceEvent.create(EventController.deviceEvent('device.created', device));
				MQTTHandler.publishMessage('device/set_device_id', JSON.stringify({previous_id: reqDeviceId, _id: device._id}));
				MQTTHandler.publishMessage('/client/device_added', JSON.stringify(device));
				res.sendStatus(200);
				console.log('Device added');
			}).catch(err => {
				console.log('STAP 3');
				console.error("Err on creating device");
				console.error(err);
				res.sendStatus(500);
			});
		} else {
			console.log("Device exists")
			res.sendStatus(500);
		}
		
		// if (deviceObj === null) {
		// 	console.log('STAP 1');
		// 	Device.create(response, {new: true}).then((device) => {
		// 		console.log('STAP 2');
		// 		console.log("NEW DEVICE CREATED!!!!!!!!!");
		// 		console.log(device);
		// 		MQTTHandler.publishMessage('device/set_device_id', JSON.stringify({previous_id: response._id, _id: device._id}));
		// 		MQTTHandler.publishMessage('/client/device_added', JSON.stringify(device));
		// 		res.sendStatus(200);
		// 		console.log('Device added');
		// 		DeviceEvent.create(EventController.deviceEvent('device.created', device));
		// 	}).catch(err => {
		// 		console.log('STAP 3');
		// 		console.error("Err on creating device");
		// 		console.error(err);
		// 		res.sendStatus(500);
		// 	});
		// } else {
		// 	console.log('STAP 4');
		// 	console.error('Device already exists');
		// 	res.sendStatus(500);
		// }
	},

	// Device name will be updated in database and checked. If OK, the new name will be published on MQTT with device ID to let device know.
	setDeviceName(req, res, next) {
		let _id = req.body._id;
		let deviceName = req.body.deviceName;
		
		console.log(_id);

		MQTTHandler.publishMessage('device/set_device_name', JSON.stringify({_id: _id, deviceName: deviceName}));
		Device.findOne({_id: _id}).then((device) => {
			if (device !== null) {
				res.sendStatus(200);
			}
		}).catch((err) => {
			res.sendStatus(500);
			console.error('err on finding device');
			console.error(err);
		})
		// Device.findOneAndUpdate({_id: _id}, {deviceName: deviceName}, {new: true}).then((response) => {
		// 	if (response !== 0) {
		// 		res.status(200)
		// 			.contentType('application/json')
		// 			.send(response);
		// 	} else {
		// 		res.sendStatus(500);
		// 	}
		// }).catch(err => {
		// 	console.error("err on setDeviceName");
		// 	console.error(err);
		// 	res.sendStatus(500);
		// })
	},
	
	// TODO: Check dependencies
	// Group is updated in database and checked. If OK, new group number is posted on MQTT with device ID to let device know.
	async setGroup(req, res, next) {
		let _id = req.body._id;
		let groupId = req.body.groupId;

		MQTTHandler.publishMessage('device/set_group_number', JSON.stringify({_id: _id, groupId: groupId}));
		Device.findOneAndUpdate({_id: _id}, {groupId: groupId}).then((device) => {
			if (device !== null) {
				res.sendStatus(200);
			}
		}).catch((err) => {
			res.sendStatus(500);
			console.error('err on finding device');
			console.error(err);
		})
		// Device.findOneAndUpdate({_id: _id}, {groupId: groupId}, {new: true}).then((device) => {
		// 	GroupController.addDeviceToGroup(device).then((result) => {
		// 		if (result === true) {
		// 			res.sendStatus(200);
		// 		} else {
		// 			res.sendStatus(500);
		// 		}
		// 	});
		// })
	},
	
	// A MQTT message with device ID is published to let device know to change powerstate. Also checks if device still exists in database.
	setPowerStateDevice(req, res, next) {
		let _id = req.body._id;
		let powerState = req.body.powerState;
		
		MQTTHandler.publishMessage('device/set_power_state', JSON.stringify({_id: _id, powerState: powerState.toString()}));
		Device.findOne({_id: _id}).then((device) => {
			if (device !== null) {
				res.sendStatus(200);
			}
		}).catch((err) => {
			res.sendStatus(500);
			console.error('err on finding device');
			console.error(err);
		})
	},
	
	// Publish soft reset device state = true message on MQTT with device ID. After 500ms post soft reset device state = false message to avoid loop.
	softResetDevice(req, res, next) {
		let _id = req.body._id;
		
		MQTTHandler.publishMessage('device/reset_device', JSON.stringify({_id: _id, soft_reset: 'true'}));
		setTimeout(() => {
			MQTTHandler.publishMessage('device/reset_device', JSON.stringify({_id: _id, soft_reset: 'false'}));
		}, 500);

		Device.findOne({_id: _id}).then((device) => {
			if (device !== null) {
				DeviceEvent.create(EventController.deviceEvent('device.soft_reset', device));
				res.sendStatus(200);
			}
		}).catch((err) => {
			res.sendStatus(500);
			console.error('err on finding device');
			console.error(err);
		})
	},
	
	// Hard reset device to clear all data on device and remove device from database. Delete from database first, then publish hard reset device state = true. After 500ms set state = false
	hardResetDevice(req, res, next) {
		let _id = req.body._id;
		
		// TODO: Check for errors
		this.deleteDevice(req);
		
		MQTTHandler.publishMessage('device/hard_reset_device', JSON.stringify({_id: _id, hard_reset: 'true'}));
		setTimeout(() => {
			MQTTHandler.publishMessage('device/hard_reset_device', JSON.stringify({_id: _id, hard_reset: 'false'}));
		}, 500);

		Device.findOne({_id: _id}).then((device) => {
			if (device !== null) {
				DeviceEvent.create(EventController.deviceEvent('device.hard_reset', device));
				res.sendStatus(200);
			}
		}).catch((err) => {
			res.sendStatus(500);
			console.error('err on finding device');
			console.error(err);
		})
	},
	
	// Publish restart state = true message on MQTT with device ID. After 500ms post restart state = false message to avoid loop.
	restartDevice(req, res, next) {
		let _id = req.body._id;
		
		MQTTHandler.publishMessage('device/restart_device', JSON.stringify({_id: _id, restart: 'true'}));
		setTimeout(() => {
			MQTTHandler.publishMessage('device/restart_device', JSON.stringify({_id: _id, restart: 'false'}));
		}, 500);

		Device.findOne({_id: _id}).then((device) => {
			if (device !== null) {
				DeviceEvent.create(EventController.deviceEvent('device.restart', device));
				res.sendStatus(200);
			}
		}).catch((err) => {
			res.sendStatus(500);
			console.error('err on finding device');
			console.error(err);
		})
	},
	
	async getAllDevices(req, res, next) {
		let devices = await Device.find({});
		res.status(200)
			.contentType('application/json')
			.send(devices);
	},
	
	async getDevice(req, res, next) {
		let _id = req.body._id;
		
		let device = await Device.findOne({_id: _id});
		device !== null ? res.status(200).contentType('application/json').send(device) :
			res.sendStatus(500);
	},
	
	async deleteDevice(req, res, next) {
		console.log(req.body);
		let removeFromGroupResult = true;
		let _id = req.body._id;
		let device = await Device.findOne({_id: _id});
		
		if (device !== null) {
			if (device.groupId !== '0') {
				removeFromGroupResult = await GroupController.removeDeviceFromGroup(device);
			}
			if (removeFromGroupResult === true) {
				Device.findOneAndDelete({_id: _id}).then((device) => {
					DeviceEvent.create(EventController.deviceEvent('device.delete', device));
					res.sendStatus(200);
				}).catch((err) => {
					res.sendStatus(500);
					console.error('err on deleting device');
					console.error(err);
				})
			}
		} else {
			res.sendStatus(500);
		}
	},
}
