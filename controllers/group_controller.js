const Group = require('../models/group.model');
const Device = require('../models/device.model');
const DeviceController = require('./device_controller');
const MQTTHandler = require('./mqtt_controller');
const mongodb = require('../config/env/env');

module.exports = {
	//Endpoints
	getAllGroups(req, res, next) {
		Group.find({}).then((groups) => {
			res.status(200)
				.contentType('application/json')
				.send(groups);
		}).catch((err) => {
			console.log('err on finding groups');
			console.log(err);
			res.sendStatus(500);
		})
	},
	
	addGroup(req, res, next) {
		let groupName = req.body.groupName;
		
		Group.findOne({groupName: groupName}).then((group) => {
			if (group === null) {
				Group.create({groupName: groupName}).then((group) => {
					MQTTHandler.publishMessage('/client/ga', JSON.stringify(group));
					res.sendStatus(200);
				}).catch((err) => {
					res.sendStatus(500);
					console.log('err on adding group');
					console.log(err);
				})
			}
		}).catch((err) => {
			res.sendStatus(500);
			console.log('err on finding group');
			console.log(err);
		})
	},
	
	async addDeviceToGroup(device) {
		let group = await Group.findOne({_id: device.groupId})
			.catch(err => {
				console.log(err);
			});
		
		if (group.devices.length === 0 || !group.devices.includes(device._id)) {
			Group.updateOne({_id: device.groupId}, {$push: {devices: device._id}}).then(() => {
				return true;
			}).catch((err) => {
				console.log('err on adding to group');
				console.log(err);
				return false;
			})
		} else {
			return false;
		}
		return true;
	},
	
	async removeGroup(req, res, next) {
		let _id = req.body._id;
		
		let group = await Group.findOne({_id: _id});
		
		console.log(group);
		
		if (group.devices.length > 0) {
			group.devices.forEach(device => {
				setGroupToDefault(device);
			})
		}
		
		Group.findOneAndDelete({_id: _id}).then(() => {
			res.sendStatus(200);
		}).catch((err) => {
			res.sendStatus(500);
			console.log('err on deleting group');
			console.log(err);
		})
	},
	
	async removeDeviceFromGroup(device) {
		let group = await Group.findOne({_id: device.groupId});
		
		if (group.devices.length > 0 && group.devices.includes(device._id)) {
			Group.updateOne({_id: device.groupId}, {$pull: {devices: device._id}}).then(() => {
				return true;
			}).catch((err) => {
				console.log('err on deleting device from group');
				console.log(err);
				return false;
			});
		} else {
			return true;
		}
		return true;
	}
}

{
	function setGroupToDefault(_id) {
		Device.findOneAndUpdate({_id: _id}, {groupId: 0}).then(() => {
			return true;
		}).catch((err) => {
			console.log('err on setting group to default');
			console.log(err);
			return false;
		});
		
		return true;
	}
}
