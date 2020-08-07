const Device = require('../models/device.model');

module.exports = {

    async powerStateSet(message) {
        await Device.findOneAndUpdate({id: message.deviceId}, {powerState: message.powerState});
    }
}
