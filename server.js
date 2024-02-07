import express from 'express';
import session from 'express-session';
import memorystore from 'memorystore';
import ejs from 'ejs';
import Docker from 'dockerode';
import { Readable } from 'stream';
import { router } from './router/index.js';
import { sequelize, Container } from './database/models.js';
import { currentLoad, mem, networkStats, fsSize, dockerContainerStats, dockerImages, networkInterfaces } from 'systeminformation';
import { containerCard } from './components/containerCard.js';
import { modal } from './components/modal.js';
import { permissionsModal } from './components/permissions_modal.js';
export var docker = new Docker();

const app = express();
const MemoryStore = memorystore(session);
const port = process.env.PORT || 8000;
let [ hidden, activeEvent, cardList, clicked ] = ['', '', '', false];
let sentList = '';
let SSE = false;
let thanks = 0;

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
            console.log(`Listening on http://localhost:${port} ✔️`);
    });
});

// Get hidden containers
async function getHidden() {
    hidden = await Container.findAll({ where: {visibility:false}});
    hidden = hidden.map((container) => container.name);
}

// Server metrics
let [ cpu, ram, tx, rx, disk ] = [0, 0, 0, 0, 0];
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

// Docker containers
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


// Store docker events 
docker.getEvents((err, stream) => {
    if (err) throw err;
    stream.on('data', (chunk) => {
        activeEvent += chunk.toString('utf8');
    });
});

// Check if the container cards need to be updated
setInterval(async () => {
    if (activeEvent == '') { return; }
    activeEvent = '';
    await getHidden();
    await containerCards();
    if (cardList != sentList) {
        cardList = sentList;
        SSE = true;
    }
}, 1000);



/////////////////// HTMX routes //////////////////////////


router.get('/stats', async (req, res) => {
    if (req.session.UUID == undefined) { return; }

    switch (req.header('HX-Trigger')) {
        case 'cpu': 
        let info = '<div class="font-weight-medium">';
            info += '<label class="cpu-text mb-1" for="cpu">CPU ' + cpu + '%</label>';
            info += '</div>';
            info += '<div class="cpu-bar meter animate">';
            info += '<span style="width:' + cpu + '%"><span></span></span>';
            info += '</div>';
            res.send(info);
            break;
        case 'ram':
        let info2 = '<div class="font-weight-medium">';
            info2 += '<label class="ram-text mb-1" for="ram">RAM ' + ram + '%</label>';
            info2 += '</div>';
            info2 += '<div class="ram-bar meter animate orange">';
            info2 += '<span style="width:' + ram + '%"><span></span></span>';
            info2 += '</div>';
            res.send(info2);
            break;
        case 'tx':
            res.send('TX ' + tx.toFixed(2) + ' MB');
            break;
        case 'rx':
            res.send('RX ' + rx.toFixed(2) + ' MB');
            break;
        case 'disk':
        let info5 = '<div class="font-weight-medium">';
            info5 += '<label class="disk-text mb-1" for="disk">Disk ' + disk + '%</label>';
            info5 += '</div>';
            info5 += '<div class="disk-bar meter animate red">';
            info5 += '<span style="width:' + disk + '%"><span></span></span>';
            info5 += '</div>';
            res.send(info5);
            break;
        default:
            console.log('Unknown trigger');
            break;
    }
});

router.get('/containers', async (req, res) => {
    if (req.session.UUID == undefined) { return; }

    await getHidden();
    await containerCards();
    sentList = cardList;
    res.send(cardList);
});

router.get('/action', async (req, res) => {
    if (req.session.UUID == undefined) { return; }

    let name = req.header('hx-trigger-name');
    let id = req.header('hx-trigger');
    let value = req.query[name];

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
});

router.get('/hide', async (req, res) => {
    if (req.session.UUID == undefined) { return; }

    let name = req.header('hx-trigger-name');
    let id = req.header('hx-trigger');

    if (id == 'hide') {
        let exists = await Container.findOne({ where: {name: name}});
        if (!exists) {
            const newContainer = await Container.create({ name: name, visibility: false, });
            SSE = true;
            return;
        } else {
            exists.update({ visibility: false });
            SSE = true;
            return;
        }
    }

    if (id == 'reset') {
        Container.update({ visibility: true }, { where: {} });
        SSE = true;
    }
});



router.get('/logs', async (req, res) => {
    if (req.session.UUID == undefined) { return; }
    
    let name = req.header('hx-trigger-name');
    
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
                if (err) { reject(err); return; }
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
        res.send(`<pre>${data}</pre> `)
    });
});


router.get('/sse_event', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive', });
    let eventCheck = setInterval(async () => {
        if (SSE == true) {
            SSE = false;
            res.write(`event: docker\n`);
            res.write(`data: there was a docker event!\n\n`);
        }
    }, 1000);
    req.on('close', () => {
        clearInterval(eventCheck);
    });
});



router.get('/modal', async (req, res) => {
    if (req.session.UUID == undefined) { return; }

    let name = req.header('hx-trigger-name');
    let id = req.header('hx-trigger');

    if (id == 'permissions') {
        let form = permissionsModal();
        res.send(form);
        return;
    }


    let containerId = docker.getContainer(name);
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
        name: containerInfo.Name.slice(1),
        state: containerInfo.State.Status,
        image: containerInfo.Config.Image,
        external_port: external_port,
        internal_port: internal_port,
        ports: ports_list,
        link: 'localhost',
    }
    
    let form = modal(container_info);
    res.send(form);
});


let stats = {};
router.get('/chart', async (req, res) => {
    if (req.session.UUID == undefined) { return; }

    let name = req.header('hx-trigger-name');
    // create an empty array if it doesn't exist
    if (!stats[name]) {
        stats[name] = { cpuArray: Array(15).fill(0), ramArray: Array(15).fill(0) };
    }
    // get the stats
    const info = await dockerContainerStats(name);
    // update the arrays
    stats[name].cpuArray.push(Math.round(info[0].cpuPercent));
    stats[name].ramArray.push(Math.round(info[0].memPercent));
    // slice them down to the last 15 values
    stats[name].cpuArray = stats[name].cpuArray.slice(-15);
    stats[name].ramArray = stats[name].ramArray.slice(-15);
    // replace the chart with the new data
    let chart = `
        <script>
            ${name}chart.updateSeries([{
                data: [${stats[name].cpuArray}]
            }, {
                data: [${stats[name].ramArray}]
            }])
        </script>`
    res.send(chart);
});



router.get('/thank', async (req, res) => {
    let name = req.header('hx-trigger-name');
    thanks++;
    let data = thanks.toString();
    if (thanks > 999) {
        data = 'Did you really click 1000 times?!';
    }
    res.send(data);
});