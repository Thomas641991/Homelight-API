const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupEventSchema = new Schema({
    routingkey: {
        type: String,
        required: true
    },
    group: {
        type: mongoose.Schema.Types.Object,
        ref: 'group',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now()
    }
});

const GroupEvent = mongoose.model('groupEvent', GroupEventSchema);

module.exports = GroupEvent;
