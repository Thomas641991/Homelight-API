const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet')
const morgan = require('morgan')
const mongoose = require('mongoose');
const routes = require('./routes/routes');
const MQTTHandler = require('./controllers/mqtt.controller');
const deviceController = require('./controllers/device_client.controller');
const mongoDB = require('./config/env/mongo_env')

const app = express();
mongoose.Promise = global.Promise;

mongoDB.connect();

app.use(helmet())
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'))

routes(app);

app.use((err, req, res, next) => {
	res.status(422).send({error: err.message});
});

MQTTHandler.setupMQTT();

deviceController.searchForDevices();

module.exports = app;
