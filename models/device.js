const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeviceSchema = new Schema({
    deviceId: {
        type: Number,
        required: true
    },
    deviceIp: {
        type: String,
        required: true
    },
    deviceName: {
        type: String,
        required: true
    },
    groupNumber: {
        type: Number,
        required: true
    },
    powerState: {
        type: Number,
        required: true
    }
});

const Device = mongoose.model('device', DeviceSchema);

module.exports = Device;
