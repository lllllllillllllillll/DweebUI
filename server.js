import express from 'express';
import session from 'express-session';
import memorystore from 'memorystore';
import ejs from 'ejs';
import { router } from './router/index.js';
import { sequelize, ServerSettings } from './database/models.js';

import Docker from 'dockerode';

export var [ docker, docker2, docker3, docker4 ] = [ null, null, null, null ];
export let [ host_list, host2_list, host3_list, host4_list ] = [ [], [], [], [] ];
var docker = new Docker();

// Session middleware
const secure = process.env.HTTPS || false;
const MemoryStore = memorystore(session);
const sessionMiddleware = session({
    store: new MemoryStore({ checkPeriod: 86400000 }), // Prune expired entries every 24h
    secret: "keyboard cat", 
    resave: false, 
    saveUninitialized: false, 
    cookie:{
        secure: secure, 
        httpOnly: secure,
        maxAge: 3600000 * 8 // Session max age in milliseconds. 3600000 = 1 hour.
    }
});

// Express middleware
const app = express();
const PORT = process.env.PORT || 8000;
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);
app.use([
    express.static('public'),
    express.urlencoded({ extended: true }),
    sessionMiddleware,
    router
]);

// Initialize server
app.listen(PORT, async () => {
    async function init() {// I made sure the console.logs and emojis lined up
        try { await sequelize.authenticate().then(
            () => { console.log('DB Connection: ✅') }); }
            catch { console.log('DB Connection: ❌'); }
        try { await sequelize.sync().then(
            () => { console.log('Synced Models: ✅') }); }
            catch { console.log('Synced Models: ❌'); } }
        await init().then(() => { 
            newEvent('host');
            console.log(`Listening on http://localhost:${PORT}`);
    });
});

// Configure Docker hosts.
for (let i = 2; i < 5; i++) {
    try {
        if (i == 2) { 
            let config = await ServerSettings.findOne({ where: { key: 'host2' }});
            if (config.value != 'off' && config.value != '') {
                let values = config.value.split(',');
                let port = values[2];
                let address = values[1];
                docker2 = new Docker({protocol:'http', host: address, port: port});
                console.log(`Configured ${host} on ${address}:${port}`);
                let test = await docker2.listContainers({ all: true });
                console.log(`${host}: ${test.length} containers`);
            }
        } else if (i == 3) {
            let config = await ServerSettings.findOne({ where: { key: 'host3' }});
            if (config.value != 'off' && config.value != '') {
                let values = config.value.split(',');
                let port = values[2];
                let address = values[1];
                docker3 = new Docker({protocol:'http', host: address, port: port});
                console.log(`Configured ${host} on ${address}:${port}`);
                let test = await docker3.listContainers({ all: true });
                console.log(`${host}: ${test.length} containers`);
            }
        } else if (i == 4) {
            let config = await ServerSettings.findOne({ where: { key: 'host4' }});
            if (config.value != 'off' && config.value != '') {
                let values = config.value.split(',');
                let port = values[2];
                let address = values[1];
                docker4 = new Docker({protocol:'http', host: address, port: port});
                console.log(`Configured ${host} on ${address}:${port}`);
                let test = await docker4.listContainers({ all: true });
                console.log(`${host}: ${test.length} containers`);
            }
        }

    } catch {
       console.log(`host${i}: Not configured.`);
    }
}



async function updateList(host) {
    if (host == 'host') {
        let containers = await docker.listContainers({ all: true });
        host_list = containers.map(container => ({ containerID: container.Id, containers: container.State }));
    } else if (host == 'host2') {
        let containers = await docker2.listContainers({ all: true });
        host2_list = containers.map(container => ({ containerID: container.Id, containers: container.State }));
    } else if (host == 'host3') {
        let containers = await docker3.listContainers({ all: true });
        host3_list = containers.map(container => ({ containerID: container.Id, containers: container.State }));
    } else if (host == 'host4') {
        let containers = await docker4.listContainers({ all: true });
        host4_list = containers.map(container => ({ containerID: container.Id, containers: container.State }));
    }
}

let event = false;
let skipped_events = 0;
// Debounce.
function newEvent(host) {
    if (!event) {
        event = true;
        console.log(`New event from ${host}`);
        updateList(host);
        setTimeout(() => {
            event = false;
            console.log(`Skipped ${skipped_events} events`);
            skipped_events = 0;
        }, 300);
    } else { skipped_events++; }
}

docker.getEvents({}, function (err, data) {
    data.on('data', function () {
        newEvent('host');
    });
}); 

// if (docker2) {
//     docker2.getEvents({}, function (err, data) {
//         data.on('data', function () {
//             newEvent('host2');
//         });
//     });
// }

// if (docker3) {
//     docker3.getEvents({}, function (err, data) {
//         data.on('data', function () {
//             newEvent('host3');
//         });
//     });
// }

// if (docker4) {
//     docker4.getEvents({}, function (err, data) {
//         data.on('data', function () {
//             newEvent('host4');
//         });
//     });
// }
