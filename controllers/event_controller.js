module.exports = {
    deviceEvent(routingkey, request) {
        console.log("request: ");
        console.log(request);
        return {
            routingkey: routingkey,
            device: {
                _id: request._id,
                deviceIp: request.deviceIp,
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
