const deviceController = require('../controllers/device_client_controller');
const groupController = require('../controllers/group_client_controller');
const systemController = require('../controllers/system_controller');

module.exports = (app) => {
    
    //Device
    
    //GET
    app.post('/allDevices', deviceController.getAllDevices);
    app.post('/getDevice', deviceController.getDevice);
    
    //POST
    app.post('/addNewDevice', deviceController.addDevice);
    app.post('/setDeviceName', deviceController.setDeviceName);
    app.post('/setGroup', deviceController.setGroup);
    app.post('/setPowerState', deviceController.setPowerStateDevice);
    app.post('/softResetDevice', deviceController.softResetDevice);
    app.post('/hardResetDevice', deviceController.hardResetDevice);
    app.post('/restartDevice', deviceController.restartDevice);
    app.post('/deleteDevice', deviceController.deleteDevice);
    
    //App
    //TODO: APP ROUTES
    
    //Group
    //GET
    app.post('/allGroups', groupController.getAllGroups);
    
    //POST
    app.post('/addGroup', groupController.addGroup);
    app.post('/removeGroup', groupController.removeGroup);
    
    //System
    //POST
    app.post('/updateSystem', systemController.updateSystem)
};
