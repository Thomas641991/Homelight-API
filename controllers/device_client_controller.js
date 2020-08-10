const Device = require('../models/device.model');
const DeviceEvent = require('../models/device_event.model');
const EventController = require('./event_controller');
const GroupController = require('./group_client_controller');
const MQTTHandler = require('./mqtt_controller');
const mongodb = require('../config/env/env');

let deviceArray = [];

module.exports = {
	
	// Ask all devices to give id, ip, name, groupId and powerState to check if already connected on boot
	searchForDevices() {
		MQTTHandler.publishMessage('all/', 'search_device');
	},
	
	// Endpoints
	
	// New device will be added in database and checked. After that a device added message will be published on MQTT for clients
	async addDevice(req, res, next) {
		
		let device = new Device({
			deviceIp: req.body.deviceIp,
			deviceName: req.body.deviceName,
			groupId: req.body.groupId,
			powerState: req.body.powerState
		});
		
		console.log(res.body);
		
		let deviceObj = await Device.find({deviceName: device.deviceName, deviceIp: device.deviceIp});
		console.log(deviceObj);
		
		if (deviceObj === 0) {
			
			Device.create(device).then((device) => {
				MQTTHandler.publishMessage('/client/device_added', JSON.stringify(deviceArray));
				res.sendStatus(200);
				console.log('Device added');
				DeviceEvent.create(EventController.deviceEvent('device.created', device));
			}).catch(err => {
				console.error("Err on creating device");
				console.error(err);
				res.sendStatus(500);
			});
		} else {
			console.error('Device already exists');
			res.sendStatus(500);
		}
	},

	// TODO: Remove ID from topic and into message
	// Device name will be updated in database and checked. If OK, the new name will be published on MQTT with device ID to let device know.
	setDeviceName(req, res, next) {
		let _id = req.body._id;
		let deviceName = req.body.deviceName;

		MQTTHandler.publishMessage('device/' + _id + '/set_device_name', deviceName);
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
	
	
	// Group is updated in database and checked. If OK, new group number is posted on MQTT with device ID to let device know.
	async setGroup(req, res, next) {
		let _id = req.body._id;
		let groupId = req.body.groupId;

		MQTTHandler.publishMessage('device/' + _id + '/set_group_number', groupId);
		Device.findOne({_id: _id}).then((device) => {
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
		
		MQTTHandler.publishMessage('device/' + _id + '/set_power_state', powerState.toString());
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
		
		MQTTHandler.publishMessage('device/' + _id + '/reset_device', 'true');
		setTimeout(() => {
			MQTTHandler.publishMessage('device/' + _id + '/reset_device', 'false');
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
		
		MQTTHandler.publishMessage('device/' + _id + '/hard_reset_device', 'true');
		setTimeout(() => {
			MQTTHandler.publishMessage('device/' + _id + '/hard_reset_device', 'false');
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
		
		MQTTHandler.publishMessage('device/' + _id + '/restart_device', 'true');
		setTimeout(() => {
			MQTTHandler.publishMessage('device/' + _id + '/restart_device', 'false');
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
