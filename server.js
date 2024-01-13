import express from 'express';
import session from 'express-session';
import compression from 'compression';
import helmet from 'helmet';
import Docker from 'dockerode';
import cors from 'cors';
import { Readable } from 'stream';
import { rateLimit } from 'express-rate-limit';
import { instrument } from '@socket.io/admin-ui'
import { router } from './router/index.js';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { sequelize, Container } from './database/models.js';
import { currentLoad, mem, networkStats, fsSize, dockerContainerStats, dockerImages, networkInterfaces } from 'systeminformation';
import { containerCard } from './components/containerCard.js';

export const app = express();
const server = createServer(app);
const port = process.env.PORT || 8000;
export var docker = new Docker();
let [cpu, ram, tx, rx, disk] = [0, 0, 0, 0, 0];
let [hidden, clicked, dockerEvents] = ['', false, ''];
let metricsInterval, cardsInterval, graphsInterval;
let cardList = '';
const statsArray = {};

// Socket.io admin ui
export const io = new Server(server, { 
    connectionStateRecovery: {},
    cors: {
        origin: ['http://localhost:8000', 'https://admin.socket.io'],
        methods: ['GET', 'POST'],
        credentials: true
    } 
});
instrument(io, {
    auth: false,
    readonly: true
});

// Session middleware
const sessionMiddleware = session({
    secret: "keyboard cat", 
    resave: false, 
    saveUninitialized: false, 
    cookie:{
        secure:false, // Only set to true if you are using HTTPS.
        httpOnly:false, // Only set to true if you are using HTTPS.
        maxAge:3600000 * 8 // Session max age in milliseconds. 3600000 = 1 hour.
    }
});

// Make session data available to socket.io
io.engine.use(sessionMiddleware); 

// Rate limiter
const limiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 minutes
	limit: 50, // Limit each IP to 50 requests per `window`.
	standardHeaders: 'draft-7',
	legacyHeaders: false,
})

// Express middleware
app.set('view engine', 'ejs');
app.use([
    compression(),
    cors(),
    helmet({contentSecurityPolicy: false}),
    express.static("public"),
    express.json(),
    express.urlencoded({ extended: true }),
    sessionMiddleware,
    router,
    limiter
]);

// Initialize server
server.listen(port, async () => {
    async function init() {
        try { await sequelize.authenticate().then(() => { console.log('[Connected to DB]') }); } 
            catch { console.log('[Could not connect to DB]'); }
        try { await sequelize.sync().then(() => { console.log('[Models Synced]') }); } 
            catch { console.log('[Could not Sync Models]', error); }
        await getHidden();
        containerCards();
    }
    await init();
    app.emit("appStarted");
    console.log(`\nServer listening on http://localhost:${port}`);
});

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

// List docker containers
let containerCards = async () => {
    let list = '';
    const allContainers = await docker.listContainers({ all: true });
    for (const container of allContainers) {
        if (!hidden.includes(container.Names[0].slice(1))) {

            let imageVersion = container.Image.split('/');
            let service = imageVersion[imageVersion.length - 1].split(':')[0];
            let containerId = docker.getContainer(container.Id);
            let containerInfo = await containerId.inspect();
            let ports_list = [];
            try {
            for (const [key, value] of Object.entries(containerInfo.HostConfig.PortBindings)) {
                let ports = {
                    check: 'checked',
                    external: value[0].HostPort,
                    internal: key.split('/')[0],
                    protocol: key.split('/')[1]
                }
                ports_list.push(ports);
            }
            } catch {}

            let external_port = ports_list[0]?.external || 0;
            let internal_port = ports_list[0]?.internal || 0;

            let container_info = {
                name: container.Names[0].slice(1),
                service: service,
                id: container.Id,
                state: container.State,
                image: container.Image,
                external_port: external_port,
                internal_port: internal_port,
                ports: ports_list,
                link: 'localhost',
            }
            let card = containerCard(container_info);
            list += card;
        }
    }
    cardList = list;
}

// Container metrics
let containerStats = async () => {
    const data = await docker.listContainers({ all: true });
    for (const container of data) {
        if (!hidden.includes(container.Names[0].slice(1))) {
            const stats = await dockerContainerStats(container.Id);
            const name = container.Names[0].slice(1);

            if (!statsArray[name]) {
                statsArray[name] = {
                    cpuArray: Array(15).fill(0),
                    ramArray: Array(15).fill(0)
                };
            }
            statsArray[name].cpuArray.push(Math.round(stats[0].cpuPercent));
            statsArray[name].ramArray.push(Math.round(stats[0].memPercent));

            statsArray[name].cpuArray = statsArray[name].cpuArray.slice(-15);
            statsArray[name].ramArray = statsArray[name].ramArray.slice(-15);
        }
    }
}

// Store docker events 
docker.getEvents((err, stream) => {
    if (err) throw err;
    stream.on('data', (chunk) => {
        dockerEvents += chunk.toString('utf8');
    });
});

// Check for docker events
setInterval( () => {
    if (dockerEvents != '') {
        getHidden();
        containerCards();
        dockerEvents = '';
    }
}, 1000);

// Get hidden containers
async function getHidden() {
    hidden = await Container.findAll({ where: {visibility:false}});
    hidden = hidden.map((container) => container.name);
}

// Socket.io
io.on('connection', (socket) => {
    let sessionData = socket.request.session;
    let sent = '';
    if (sessionData.user != undefined) {
        console.log(`${sessionData.user} connected from ${socket.handshake.headers.host}`);
        
        // Start intervals if not already started
        if (!metricsInterval) {
            serverMetrics();
            metricsInterval = setInterval(serverMetrics, 1000);
            console.log('Metrics interval started');
        }
        if (!cardsInterval) {
            containerCards();
            cardsInterval = setInterval(containerCards, 1000);
            console.log('Cards interval started');
        }
        if (!graphsInterval) {
            containerStats();
            graphsInterval = setInterval(containerStats, 1000);
            console.log('Graphs interval started');
        }

        setInterval(() => {
            socket.emit('metrics', [cpu, ram, tx, rx, disk]);
            if (sent != cardList) {
                sent = cardList;
                socket.emit('containers', cardList);
            }
            socket.emit('containerStats', statsArray);
        }, 1000);



        // Client input        
        socket.on('clicked', (data) => {
            if (clicked == true) { return; } clicked = true;
            let { name, id, value } = data;
            console.log(`${sessionData.user} clicked: ${id} ${value} ${name}`);

            // View container logs
            if (id == 'logs'){
                function containerLogs (data) {
                    return new Promise((resolve, reject) => {
                        let logString = '';
                
                        var options = {
                            follow: false,
                            stdout: true,
                            stderr: false,
                            timestamps: false
                        };
                
                        var containerName = docker.getContainer(data);
                
                        containerName.logs(options, function (err, stream) {
                            if (err) {
                                reject(err);
                                return;
                            }
                
                            const readableStream = Readable.from(stream);
                
                            readableStream.on('data', function (chunk) {
                                logString += chunk.toString('utf8');
                            });
                
                            readableStream.on('end', function () {
                                resolve(logString);
                            });
                        });
                    });
                };
                containerLogs(name).then((data) => {
                    socket.emit('logs', data);
                }).catch((err) => {
                    console.log(err);
                });

            }

            // start, stop, pause, restart container
            if (id == 'start' || id == 'stop' || id == 'pause' || id == 'restart'){
                var containerName = docker.getContainer(name);
        
                if ((id == 'start') && (value == 'stopped')) {
                    containerName.start();
                } else if ((id == 'start') && (value == 'paused')) {
                    containerName.unpause();
                } else if ((id == 'stop') && (value != 'stopped')) {
                    containerName.stop();
                } else if ((id == 'pause') && (value == 'running')) {
                    containerName.pause();
                } else if ((id == 'pause') && (value == 'paused')) {
                    containerName.unpause();
                } else if (id == 'restart') {
                    containerName.restart();
                }
            }

            // hide container
            if (id == 'hide') {
                async function hideContainer() {
                    let containerExists = await Container.findOne({ where: {name: name}});
                    if(!containerExists) {
                        const newContainer = await Container.create({ name: name, visibility: false, });
                        getHidden();
                    } else {
                        containerExists.update({ visibility: false });
                        getHidden();
                    }
                    
                }
                hideContainer();
            }

            // unhide containers
            if (id == 'resetView') {
                Container.update({ visibility: true }, { where: {} });
                getHidden();
            }
                
            clicked = false;
        });

        socket.on('disconnect', () => {
            console.log(`${sessionData.user} disconnected`);
            socket.disconnect();
            // clear intervals if no users are connected
            if (io.engine.clientsCount == 0) {
                clearInterval(metricsInterval);
                clearInterval(cardsInterval);
                clearInterval(graphsInterval);
                metricsInterval = null;
                cardsInterval = null;
                graphsInterval = null;
                console.log('All intervals cleared');
            }
        });
    } else {
        console.log('Missing session data');
    }
});








// let link = '';
// networkInterfaces().then(data => {
//     link = data[0].ip4;
// });

