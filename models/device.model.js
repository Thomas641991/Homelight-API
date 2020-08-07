const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeviceSchema = new Schema({
	deviceIp: {
		type: String,
		required: true
	},
	deviceName: {
		type: String,
		required: true
	},
	groupId: {
		type: String,
		required: true,
		defaultValue: 0
	},
	powerState: {
		type: Number,
		required: true
	}
});

const DeviceModel = mongoose.model('device', DeviceSchema);

module.exports = DeviceModel;
