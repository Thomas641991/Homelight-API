const mongoose = require('mongoose');
const config = require('./env');

mongoose.Promise = global.Promise;

let connection = mongoose.connection
	.once('open', () => console.log('Connected to MongoDB on ' + config.dburl))
	.on('error', (error) => {
		console.error('Error', error);
	});

module.exports = connection;
