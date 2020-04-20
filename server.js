const app = require('./app');
const config = require('./config/env/env');

app.listen(config.env.webPort, () => {
    console.log('Running on port ' + config.env.webPort);
    console.log('Date and time started: ' + new Date())
});
