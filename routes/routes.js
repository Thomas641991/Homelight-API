const auth = require('../auth/auth')
const deviceClientController = require('../controllers/device_client.controller');
const groupClientController = require('../controllers/group_client.controller');
const systemController = require('../controllers/system.controller');
const userController = require('../controllers/user.controller')

module.exports = (app) => {
	//App
	//POST
	app.post('/register', userController.register);
	app.post('/login', userController.login);
	app.post('/signOut', auth.authenticateToken, userController.signOut)

	//Device
	//GET
	app.post('/allDevices', auth.authenticateToken, deviceClientController.getAllDevices);
	app.post('/getDevice', auth.authenticateToken, deviceClientController.getDevice);

	//POST
	app.post('/addNewDevice', auth.authenticateToken, deviceClientController.addDevice);
	app.post('/setDeviceName', auth.authenticateToken, deviceClientController.setDeviceName);
	app.post('/setGroup', auth.authenticateToken, deviceClientController.setGroup);
	app.post('/setPowerState', auth.authenticateToken, deviceClientController.setPowerStateDevice);
	app.post('/softResetDevice', auth.authenticateToken, deviceClientController.softResetDevice);
	app.post('/hardResetDevice', auth.authenticateToken, deviceClientController.hardResetDevice);
	app.post('/restartDevice', auth.authenticateToken, deviceClientController.restartDevice);
	app.post('/deleteDevice', auth.authenticateToken, deviceClientController.deleteDevice);

	//Group
	//GET
	app.post('/allGroups', auth.authenticateToken, groupClientController.getAllGroups);

	//POST
	app.post('/addGroup', auth.authenticateToken, groupClientController.addGroup);
	app.post('/removeGroup', auth.authenticateToken, groupClientController.removeGroup);

	//System
	//POST
	app.post('/updateSystem', auth.authenticateToken, systemController.updateSystem)
};
