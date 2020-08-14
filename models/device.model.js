const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeviceSchema = new Schema({
	deviceIp: {
		type: String,
		required: true
	},
	deviceName: {
		type: String,
		required: false
	},
	groupId: {
		type: String,
		required: true,
		defaultValue: 0
	},
	powerState: {
		type: Number,
		required: true
	},
	previousId: {
		type: String,
		required: false
	}
});

const DeviceModel = mongoose.model('device', DeviceSchema);

module.exports = DeviceModel;
