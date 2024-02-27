import express from 'express';
import session from 'express-session';
import memorystore from 'memorystore';
import ejs from 'ejs';
import Docker from 'dockerode';
import { router } from './router/index.js';
import { sequelize } from './database/models.js';
import { currentLoad, mem, networkStats, fsSize } from 'systeminformation';

export var docker = new Docker();
export { setEvent, cpu, ram, tx, rx, disk }

const app = express();
const MemoryStore = memorystore(session);
const port = process.env.PORT || 8000;
let [ cpu, ram, tx, rx, disk ] = [0, 0, 0, 0, 0];
let [ event, eventType ] = [false, 'docker'];

// Session middleware
const sessionMiddleware = session({
    store: new MemoryStore({ checkPeriod: 86400000 }), // Prune expired entries every 24h
    secret: "keyboard cat", 
    resave: false, 
    saveUninitialized: false, 
    cookie:{
        secure:false, // Only set to true if you are using HTTPS.
        httpOnly:false, // Only set to true if you are using HTTPS.
        maxAge:3600000 * 8 // Session max age in milliseconds. 3600000 = 1 hour.
    }
});

// Express middleware
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);
app.use([
    express.static('public'),
    express.json(),
    express.urlencoded({ extended: true }),
    sessionMiddleware,
    router
]);

// Initialize server
app.listen(port, async () => {
    async function init() {
        try { await sequelize.authenticate().then(
            () => { console.log('DB Connection: ✔️') }); }
            catch { console.log('DB Connection: ❌'); }
        try { await sequelize.sync().then( // check out that formatting
            () => { console.log('Synced Models: ✔️') }); }
            catch { console.log('Synced Models: ❌'); } }
        await init().then(() => { 
            console.log(`Listening on http://localhost:${port}`);
    });
});

function setEvent(value, type) {
    event = value;
    eventType = type;
}

// Server metrics
let serverMetrics = async () => {
    currentLoad().then(data => { 
        cpu = Math.round(data.currentLoad); 
    });
    mem().then(data => { 
        ram = Math.round((data.active / data.total) * 100); 
    });
    networkStats().then(data => { 
        tx = data[0].tx_bytes / (1024 * 1024); 
        rx = data[0].rx_bytes / (1024 * 1024); 
    });
    fsSize().then(data => { 
        disk = data[0].use; 
    });
}
setInterval(serverMetrics, 1000);

let sent_list = '';
router.get('/sse_event', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive', });
    let eventCheck = setInterval(async() => {
        let all_containers = '';
        await docker.listContainers({ all: true }).then(containers => {
            containers.forEach(container => {
                all_containers += `${container.Names}: ${container.State}\n`;
            });
        });
        if ((all_containers != sent_list) || (event == true)) {
            console.log('event triggered');
            sent_list = all_containers;
            event = false;
            res.write(`event: ${eventType}\n`);
            res.write(`data: there was an event!\n\n`);
        }
    }, 1000);
    req.on('close', () => {
        clearInterval(eventCheck);
    });
});