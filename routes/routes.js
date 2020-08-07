const deviceClientController = require('../controllers/device_client_controller');
const groupClientController = require('../controllers/group_client_controller');
const systemController = require('../controllers/system_controller');

module.exports = (app) => {
    
    //Device
    
    //GET
    app.post('/allDevices', deviceClientController.getAllDevices);
    app.post('/getDevice', deviceClientController.getDevice);
    
    //POST
    app.post('/addNewDevice', deviceClientController.addDevice);
    app.post('/setDeviceName', deviceClientController.setDeviceName);
    app.post('/setGroup', deviceClientController.setGroup);
    app.post('/setPowerState', deviceClientController.setPowerStateDevice);
    app.post('/softResetDevice', deviceClientController.softResetDevice);
    app.post('/hardResetDevice', deviceClientController.hardResetDevice);
    app.post('/restartDevice', deviceClientController.restartDevice);
    app.post('/deleteDevice', deviceClientController.deleteDevice);
    
    //App
    //TODO: APP ROUTES
    
    //Group
    //GET
    app.post('/allGroups', groupClientController.getAllGroups);
    
    //POST
    app.post('/addGroup', groupClientController.addGroup);
    app.post('/removeGroup', groupClientController.removeGroup);
    
    //System
    //POST
    app.post('/updateSystem', systemController.updateSystem)
};
