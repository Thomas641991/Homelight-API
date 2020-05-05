const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupSchema = new Schema({
	groupName: {
		type: String,
		required: true
	},
	devices: [{
		type: Schema.Types.ObjectId,
		ref: 'device'
	}]
	
});

const GroupModel = mongoose.model('group', GroupSchema);

module.exports = GroupModel;
