const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeviceEventSchema = new Schema({
    routingkey: {
        type: String,
        required: true
    },
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'device',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now()
    }
});

const DeviceEvent = mongoose.model('deviceEvent', DeviceEventSchema);

module.exports = DeviceEvent;
