const exec = require('child_process').exec
const updateShellScript = exec('../update.sh', {shell: '/bin/bash'});

module.exports ={

	// Used to update to new version of API.
	updateSystem(req, res, next) {
		
		exec('../update.sh', {shell: '/bin/bash'}, (err, stdout, stderr) => {
			res.sendStatus(200);
			console.log('OUTPUT', stdout, stderr);
		});
		
		// console.log(req);
		// updateShellScript.stdout.on('data', (data) => {
		// 	res.sendStatus(200);
		// 	console.log(data);
		// })
		// updateShellScript.stderr.on('data', (data) => {
		// 	console.error(data);
		// })
	}
}
