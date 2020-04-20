const Device = require('../models/device');
const MQTTHandler = require('./mqtt_controller');

let deviceArray = [];

module.exports = {
	searchForDevices() {
		MQTTHandler.publishMessage('all/', 'sdi');
	},
	
	//Endpoints
	addDevice(req, res, next) {
		let device = new Device({
			deviceId: req.body.deviceId,
			deviceIp: req.body.deviceIp,
			deviceName: req.body.deviceName,
			groupNumber: req.body.groupNumber,
			powerState: req.body.powerState
		});
		
		if(!deviceArray.includes(device)) {
			deviceArray.push(device);
			
			if(device.deviceId == 0) {
				setDeviceId(device.deviceId);
			} else {
				MQTTHandler.publishMessage('/client/da', JSON.stringify(deviceArray));
			}
		}
		res.sendStatus(200);
	},
	
	setDeviceName(req, res, next) {
		let deviceId = req.body.deviceId;
		let deviceName = req.body.deviceName;
		MQTTHandler.publishMessage('device/' + deviceId + '/dn', deviceName);
		res.sendStatus(200);
	},
	
	setGroupNumber(req, res, next) {
		let deviceId = req.body.deviceId;
		let groupNr = req.body.groupNr;
		MQTTHandler.publishMessage('device/' + deviceId + '/gn', groupNr.toString());
		res.sendStatus(200);
		
	},
	setPowerStateDevice(req, res, next) {
		let deviceId = req.body.deviceId;
		let powerState = req.body.powerState;
		MQTTHandler.publishMessage('device/' + deviceId + '/ps', powerState.toString());
		res.sendStatus(200);
	},
	
	softResetDevice(req, res, next) {
		let deviceId = req.body.deviceId;
		
		MQTTHandler.publishMessage('device/' + deviceId + '/rd', 'true');
		setTimeout(() => {
			MQTTHandler.publishMessage('device/' + deviceId + '/rd', 'false');
		}, 500);
		res.sendStatus(200);
	},
	
	hardResetDevice(req, res, next) {
		let deviceId = req.body.deviceId;
		
		deleteDevice(deviceId);
		
		MQTTHandler.publishMessage('device/' + deviceId + '/hrd', 'true');
		setTimeout(() => {
			MQTTHandler.publishMessage('device/' + deviceId + '/hrd', 'false');
		}, 500);
		
		res.sendStatus(200);
	},
	
	restartDevice(req, res, next) {
		let deviceId = req.body.deviceId;
		
		MQTTHandler.publishMessage('device/' + deviceId + '/res', 'true');
		setTimeout(() => {
			MQTTHandler.publishMessage('device/' + deviceId + '/res', 'false');
		}, 500);
		
		res.sendStatus(200);
	},
	
	getAllDevices(req, res, next) {
		res.send(deviceArray).status(200);
	},
	
	getDevice(req, res, next) {
		let deviceId = req.body.deviceId;
		let deviceObj;
		
		deviceArray.forEach(device => {
			if(device.deviceId == deviceId) {
				deviceObj = device;
			}
		});
		
		if(deviceObj !== null) {
			res.status(200).send(deviceObj);
		} else {
			res.status(500);
			res.json({msg: 'Could not find device'});
		}
	},
	
	deleteDeviceEnpoint(req, res, next) {
		deleteDevice(req.body.deviceId);
		res.sendStatus(200);
	},
}

function setDeviceId(deviceId) {
	let highestId = 0;
	let newDeviceId;
	
	if (deviceArray.length > 1) {
		deviceArray.forEach(device => {
			if (device.deviceId > highestId) {
				highestId = device.deviceId;
				newDeviceId = highestId + 1;
			}
		});
	} else {
		newDeviceId = 1;
	}
	
	deviceArray.forEach(device => {
		if (device.deviceId === deviceId) {
			device.deviceId = newDeviceId;
			MQTTHandler.publishMessage('device/' + deviceId + '/di', device.deviceId.toString());
			MQTTHandler.publishMessage('/client/da', JSON.stringify(deviceArray));
		}
	});
}

function deleteDevice(deviceId) {
	deviceArray.forEach((device, index) => {
		if(device.deviceId == deviceId) {
			deviceArray.splice(index, 1);
		}
	});
}
