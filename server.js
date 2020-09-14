const app = require('./app');
const config = require('./config/env/env');
const os = require('os');

app.listen(config.env.webPort, () => {
    console.log('Date and time started: ' + new Date());
    console.log('Running on: ' + getIp() + ':' + config.env.webPort);
});

function getIp() {
    const results = {};
    for(const name of Object.keys(os.networkInterfaces())) {
        for(const net of os.networkInterfaces()[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                
                results[name].push(net.address);
            }
        }
    }

    return results.en0;
}
