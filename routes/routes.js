const deviceController = require('../controllers/device_controller');

module.exports = (app) => {
    
    //Device
    
    //GET
    app.post('/allDevices', deviceController.getAllDevices);
    app.post('/getDevice', deviceController.getDevice);
    
    //POST
    app.post('/addNewDevice', deviceController.addDevice);
    app.post('/setDeviceName', deviceController.setDeviceName);
    app.post('/setGroupNumber', deviceController.setGroupNumber);
    app.post('/setPowerState', deviceController.setPowerStateDevice);
    app.post('/softResetDevice', deviceController.softResetDevice);
    app.post('/hardResetDevice', deviceController.hardResetDevice);
    app.post('/restartDevice', deviceController.restartDevice);
    app.post('/deleteDevice', deviceController.deleteDeviceEnpoint);
    
    //App
    //TODO: APP ROUTES
};
