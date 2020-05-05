let mongoose = require('mongoose');

let server = 'localhost:27017';
const database = 'HomeLight';
const options = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
}

class Database {
	connect() {
		mongoose.connect(`mongodb://${server}/${database}`, options)
			.then(() => {
				console.log('Database connection successful');
			})
			.catch(err => {
				console.error('Database connection error');
				console.log(err);
			});
	};
}

module.exports = new Database();
