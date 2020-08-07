const Device = require('../models/device.model');
const GroupController = require('./group_client_controller');
const MQTTHandler = require('./mqtt_controller');
const mongodb = require('../config/env/env');

let deviceArray = [];

module.exports = {

    // Search for devices by publishing message on MQTT for devices
    searchForDevices() {
        MQTTHandler.publishMessage('all/', 'sdi');
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

            Device.create(device).then(() => {
                MQTTHandler.publishMessage('/client/da', JSON.stringify(deviceArray));
                res.sendStatus(200);
                console.log('Device added');
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

    // Device name will be updated in database and checked. If OK, the new name will be published on MQTT with device ID to let device know.
    setDeviceName(req, res, next) {
        let _id = req.body._id;
        let deviceName = req.body.deviceName;

        Device.findOneAndUpdate({_id: _id}, {deviceName: deviceName}, {new: true}).then((response) => {
            if (response !== 0) {
                res.status(200)
                    .contentType('application/json')
                    .send(response);
                MQTTHandler.publishMessage('device/' + _id + '/dn', deviceName);
            } else {
                res.sendStatus(500);
            }
        }).catch(err => {
            console.error("err on setDeviceName");
            console.error(err);
            res.sendStatus(500);
        })
    },


    // Group is updated in database and checked. If OK, new group number is posted on MQTT with device ID to let device know.
    async setGroup(req, res, next) {
        let _id = req.body._id;
        let groupId = req.body.groupId;

        Device.findOneAndUpdate({_id: _id}, {groupId: groupId}, {new: true}).then((device) => {
            GroupController.addDeviceToGroup(device).then((result) => {
                if (result === true) {
                    MQTTHandler.publishMessage('device/' + _id + '/gn', groupId);
                    res.sendStatus(200);
                } else {
                    res.sendStatus(500);
                }
            });
        })
    },

    // Powerstate is updated in database. After that a MQTT message with device ID is published to let device know.
    // TODO: Check order, is mqtt message first faster?
    setPowerStateDevice(req, res, next) {
        let _id = req.body._id;
        let powerState = req.body.powerState;

        Device.findOne({_id: _id}).then((device) => {
            if (device !== null) {
                Device.findOneAndUpdate({_id: _id}, {powerState: powerState}).then((device) => {
                    res.sendStatus(200);
                    MQTTHandler.publishMessage('device/' + _id + '/ps', powerState.toString());
                }).catch((err) => {
                    res.sendStatus(500);
                    console.error('err on setPowerState');
                    console.error(err);
                });
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

        MQTTHandler.publishMessage('device/' + _id + '/rd', 'true');
        setTimeout(() => {
            MQTTHandler.publishMessage('device/' + _id + '/rd', 'false');
        }, 500);
        res.sendStatus(200);
    },

    // Hard reset device to clear all data on device and remove device from database. Delete from database first, then publish hard reset device state = true. After 500ms set state = false
    hardResetDevice(req, res, next) {
        let _id = req.body._id;

        // TODO: Check for errors
        this.deleteDevice(req);

        MQTTHandler.publishMessage('device/' + _id + '/hrd', 'true');
        setTimeout(() => {
            MQTTHandler.publishMessage('device/' + _id + '/hrd', 'false');
        }, 500);

        res.sendStatus(200);
    },

    // Publish restart state = true message on MQTT with device ID. After 500ms post restart state = false message to avoid loop.
    restartDevice(req, res, next) {
        let _id = req.body._id;

        MQTTHandler.publishMessage('device/' + _id + '/res', 'true');
        setTimeout(() => {
            MQTTHandler.publishMessage('device/' + _id + '/res', 'false');
        }, 500);

        res.sendStatus(200);
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
                Device.findOneAndDelete({_id: _id}).then(() => {
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
