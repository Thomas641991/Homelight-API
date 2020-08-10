const Device = require('../models/device.model');
const DeviceEvent = require('../models/device_event.model');
const EventController = require('./event_controller');
const GroupController = require('./group_client_controller');

module.exports = {

    async deviceIdSet(message) {
        let updatedDevice = await Device.findOneAndUpdate({_id: message.previousId}, {_id: message.deviceId}, {new: true})
        DeviceEvent.create(EventController.deviceEvent('device.edited', updatedDevice));
    },

    async deviceNameSet(message) {
        let updatedDevice = await Device.findOneAndUpdate({_id: message.deviceId}, {deviceName: message.deviceName}, {new: true})
        DeviceEvent.create(EventController.deviceEvent('device.edited', updatedDevice));
    },

    async groupIdSet(message) {
        if(await GroupController.addDeviceToGroup(message.deviceId, message.groupId)) {
            let updatedDevice = await Device.findOneAndUpdate({_id: message.deviceId}, {groupId: message.groupId}, {new: true})
            await DeviceEvent.create(EventController.deviceEvent('device.edited', updatedDevice));
        }
    },

    async powerStateSet(message) {
        let updatedDevice = await Device.findOneAndUpdate({_id: message.deviceId}, {powerState: message.powerState}, {new: true});
        DeviceEvent.create(EventController.deviceEvent('device.edited', updatedDevice));
    }
}
