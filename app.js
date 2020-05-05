const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const routes = require('./routes/routes');
const MQTTHandler = require('./controllers/mqtt_controller');
const deviceController = require('./controllers/device_controller');
const mongoDB = require('./config/env/mongo_env')

const app = express();
mongoose.Promise = global.Promise;

mongoDB.connect();

app.use(bodyParser.json());
app.use(cors());

routes(app);

app.use((err, req, res, next) => {
    res.status(422).send({error: err.message});
});

MQTTHandler.setupMQTT();

deviceController.searchForDevices();

module.exports = app;
