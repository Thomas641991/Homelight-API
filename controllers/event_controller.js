module.exports = {
    deviceEvent(routingkey, request) {
        return {
            routingkey: routingkey,
            device: {
                deviceIp: request. deviceIp,
                deviceName: request.deviceName,
                groupId: request.groupId,
                powerState: request.powerState,
            },
            timestamp: Date.now()
        };
    },

    groupEvent(routingkey, request) {
        return {
            routingkey: routingkey,
            group: {
                groupName: request.groupName,
                devices: request.devices
            },
            timestamp: Date.now()
        }
    }
}
