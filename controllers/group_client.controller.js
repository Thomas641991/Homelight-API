const Group = require('../models/group.model');
const GroupEvent = require('../models/group_event.model');
const EventController = require('./event.controller');
const Device = require('../models/device.model');
const MQTTHandler = require('./mqtt.controller');

module.exports = {
    // Endpoints

    // Get all groups from database
    getAllGroups(req, res, next) {
        Group.find({}).then((groups) => {
            res.status(200)
                .contentType('application/json')
                .send(groups);
        }).catch((err) => {
            console.error('err on finding groups');
            console.error(err);
            res.sendStatus(500);
        })
    },

    // Add new group to database, then publish MQTT message for clients
    addGroup(req, res, next) {
        let groupName = req.body.groupName;

        Group.findOne({groupName: groupName}).then((group) => {
            if (group === null) {
                Group.create({groupName: groupName}).then((group) => {
                    MQTTHandler.publishMessage('/client/group_added', JSON.stringify(group));
                    GroupEvent.create(EventController.groupEvent('group.created', group));
                    res.sendStatus(200);
                }).catch((err) => {
                    res.sendStatus(500);
                    console.error('err on adding group');
                    console.error(err);
                })
            }
        }).catch((err) => {
            res.sendStatus(500);
            console.error('err on finding group');
            console.error(err);
        })
    },

    // Check if device is already added to group, if not then update group and return true.
    async addDeviceToGroup(_id, groupId) {
        let group = await Group.findOne({_id: groupId})
            .catch(err => {
                console.error('err on finding group');
                console.error(err);
            });

        if (group.devices.length === 0 || !group.devices.includes(_id)) {
            Group.updateOne({_id: groupId}, {$push: {devices: _id}}).then((group) => {
                GroupEvent.create(EventController.groupEvent('group.device_added', group))
                return true;
            }).catch((err) => {
                console.error('err on adding to group');
                console.error(err);
                return false;
            })
        } else {
            return false;
        }
        return true;
    },

    // Remove all devices from group and delete group.
    async removeGroup(req, res, next) {
        let _id = req.body._id;

        let group = await Group.findOne({_id: _id});

        if (group !== null) {
            if (group.devices.length > 0) {
                group.devices.forEach(device => {
                    setGroupToDefault(device);
                });
            }

            Group.findOneAndDelete({_id: _id}).then(() => {
                GroupEvent.create(EventController.groupEvent('group.deleted', group));
                res.sendStatus(200);
            }).catch((err) => {
                res.sendStatus(500);
                console.error('err on deleting group');
                console.error(err);
            });
        }
    },

    // Remove one device from group
    async removeDeviceFromGroup(device) {
        let group = await Group.findOne({_id: device.groupId});

        if (group.devices.length > 0 && group.devices.includes(device._id)) {
            Group.updateOne({_id: device.groupId}, {$pull: {devices: device._id}}).then((group) => {
                MQTTHandler.publishMessage('device/' + device._id + '/set_group_number', 0);
                GroupEvent.create(EventController.groupEvent('group.device_removed', group));
                return true;
            }).catch((err) => {
                console.error('err on deleting device from group');
                console.error(err);
                return false;
            });
        } else {
            return true;
        }
        return true;
    }
}

{
    // Set group number to default group: 0, this is used when a populated group is deleted.
    function setGroupToDefault(_id) {
        Device.findOneAndUpdate({_id: _id}, {groupId: 0}).then(() => {
            return true;
        }).catch((err) => {
            console.error('err on setting group to default');
            console.error(err);
            return false;
        });

        return true;
    }
}
