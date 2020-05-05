const exec = require('child_process').exec
const updateShellScript = exec('../update.sh', {shell: '/bin/bash'});

module.exports ={
	updateSystem(req, res, next) {
		updateShellScript.stdout.on('data', (data) => {
			res.sendStatus(200);
			console.log(data);
		})
		updateShellScript.stderr.on('data', (data) => {
			console.error(data);
		})
	}
}
