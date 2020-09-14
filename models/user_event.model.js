const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserEventSchema = new Schema({
	routingkey: {
		type: String,
		required: true
	},
	user: {
		type: mongoose.Schema.Types.Object,
		ref: 'user',
		required: true
	},
	timestamp: {
		type: Date,
		default: Date.now()
	}
});

const UserEvent = mongoose.model('userEvent', UserEventSchema)

module.exports = UserEvent;
