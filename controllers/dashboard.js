import { Readable } from 'stream';
import { Permission, Container } from '../database/models.js';
import { docker } from '../server.js';
import { dockerContainerStats } from 'systeminformation';
import { readFileSync } from 'fs';
import { currentLoad, mem, networkStats, fsSize } from 'systeminformation';

const permissionsModal = readFileSync('./views/modals/permissions.html', 'utf8');
const uninstallModal = readFileSync('./views/modals/uninstall.html', 'utf8');
const detailsModal = readFileSync('./views/modals/details.html', 'utf8');


// The actual page
export const Dashboard = (req, res) => {
    res.render("dashboard", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.avatar,
    });
}

// Server metrics (CPU, RAM, TX, RX, DISK)
let [ cpu, ram, tx, rx, disk, stats ] = [0, 0, 0, 0, 0, {}];

let serverMetrics = setInterval(async () => {
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
}, 1000);


export const Stats = async (req, res) => {
    let name = req.header('hx-trigger-name');
    let color = req.header('hx-trigger');
    let value = 0;
    switch (name) {
        case 'CPU': value = cpu;
            break;
        case 'RAM': value = ram;
            break;
        case 'TX': value = tx;
            break;
        case 'RX': value = rx;
            break;
        case 'DISK': value = disk;
            break;
    }
    let info = `<div class="font-weight-medium">
                    <label class="cpu-text mb-1">${name} ${value}%</label>
                </div>
                <div class="cpu-bar meter animate ${color}">
                    <span style="width:${value}%"><span></span></span>
                </div>`;
    res.send(info);
}


let [ hidden, cardList, eventType, containersArray, sentArray ] = [ '', '', '', [], [] ];

// Container cards
export const Containers = async (req, res) => {
    console.log('Containers called');
    res.send(cardList);
}



let cardUpdates = [];
let newCards = '';
export const SSE = (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });

    let eventCheck = setInterval(async () => {
        // builds array of containers and their states
        containersArray = [];
        await docker.listContainers({ all: true }).then(containers => {
            containers.forEach(container => {
                let name = container.Names[0].replace('/', '');
                if (hidden.includes(name)) {
                    // do nothing
                } else {
                    containersArray.push({ container: name, state: container.State });
                }

            });
        });

        if ((JSON.stringify(containersArray) !== JSON.stringify(sentArray))) {
            cardList = '';
            newCards = '';
            cardUpdates = [];
            containersArray.forEach(container => {
                const { container: containerName, state } = container;
                const existingContainer = sentArray.find(c => c.container === containerName);
                if (!existingContainer) {
                    console.log(`New container: ${containerName}`);
                    addCard(containerName, 'newCards');
                    res.write(`event: update\n`);
                    res.write(`data: 'update cards'\n\n`);
                } else if (existingContainer.state !== state) {
                    console.log(`State of ${containerName} changed`);
                    cardUpdates.push(containerName);
                }
                addCard(containerName, 'cardList');
            });

            sentArray.forEach(container => {
                const { container: containerName } = container;
                const existingContainer = containersArray.find(c => c.container === containerName);
                if (!existingContainer) {
                    console.log(`Removed container: ${containerName}`);
                    cardUpdates.push(containerName);
                }
            });

            for (let i = 0; i < cardUpdates.length; i++) {
                res.write(`event: ${cardUpdates[i]}\n`);
                res.write(`data: 'update cards'\n\n`);
            }

            sentArray = containersArray.slice();
        }

    }, 1000);


    req.on('close', () => {
        clearInterval(eventCheck);
    });
};








// Container charts
export const Chart = async (req, res) => {
    let name = req.header('hx-trigger-name');
    console.log(`Chart called for ${name}`);
    if (!stats[name]) {
        stats[name] = { cpuArray: Array(15).fill(0), ramArray: Array(15).fill(0) };
    }
    const info = await dockerContainerStats(name);
    stats[name].cpuArray.push(Math.round(info[0].cpuPercent));
    stats[name].ramArray.push(Math.round(info[0].memPercent));
    stats[name].cpuArray = stats[name].cpuArray.slice(-15);
    stats[name].ramArray = stats[name].ramArray.slice(-15);
    let chart = `
        <script>
            ${name}chart.updateSeries([{
                data: [${stats[name].cpuArray}]
            }, {
                data: [${stats[name].ramArray}]
            }])
        </script>`
    res.send(chart);
}


export const Installs = async (req, res) => {
    let name = req.header('hx-trigger-name');
    let all_containers = '';
    res.send('ok');
}

async function addCard(container, list) {
    let card  = readFileSync('./views/partials/containerCard.html', 'utf8');
    let containerId = docker.getContainer(container);
    containerId.inspect().then(data => {

        let state = data.State.Status;
        let wrapped = container;
        let disable = "";
        let chartName = container.replace(/-/g, '');
        
        // shorten long names
        if (container.length > 13) { wrapped = container.slice(0, 10) + '...'; }
        // disable buttons for dweebui
        if (container.startsWith('dweebui')) { disable = 'disabled=""'; }
        
        // if ( external_port == undefined ) { external_port = 0; }
        // if ( internal_port == undefined ) { internal_port = 0; }
        
        let state_indicator = 'green';
        if (state == 'exited') {
            state = 'stopped';
            state_indicator = 'red';
        } else if (state == 'paused') {
            state_indicator = 'orange';
        }
        
        let trigger = 'data-hx-trigger="load, every 2s"';
        if (state != 'running') {  trigger = 'data-hx-trigger="load"'; }

        let imageVersion = data.Config.Image.split('/');
        let service = imageVersion[imageVersion.length - 1].split(':')[0];
        let ports_list = [];
        try {
        for (const [key, value] of Object.entries(data.HostConfig.PortBindings)) {
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
        card = card.replace(/AppName/g, container);
        card = card.replace(/AppShortName/g, wrapped);
        card = card.replace(/AppIcon/g, service);
        card = card.replace(/AppState/g, state);
        card = card.replace(/StateColor/g, state_indicator);
        card = card.replace(/ChartName/g, chartName);
        card = card.replace(/AppNameState/g, `${container}State`);
        card = card.replace(/data-trigger=""/, trigger);
        if (list == 'newCards') {
            newCards += card;
        } else {
            cardList += card;
        }
    });   
}

export const updateCards = async (req, res) => {
    console.log('updateCards called');
    res.send(newCards);
}






export const Card = (req, res) => {
    let name = req.header('hx-trigger-name');
    console.log(`Updated card for ${name}`);

    let newCard = readFileSync('./views/partials/containerCard.html', 'utf8');
    
    let containerId = docker.getContainer(name);
    containerId.inspect().then(data => {

        let state = data.State.Status;
        let wrapped = name;
        let disable = "";
        let chartName = name.replace(/-/g, '');
        
        // shorten long names
        if (name.length > 13) { wrapped = name.slice(0, 10) + '...'; }
        // disable buttons for dweebui
        if (name.startsWith('dweebui')) { disable = 'disabled=""'; }
        
        // if ( external_port == undefined ) { external_port = 0; }
        // if ( internal_port == undefined ) { internal_port = 0; }
        
        let state_indicator = 'green';
        if (state == 'exited') {
            state = 'stopped';
            state_indicator = 'red';
        } else if (state == 'paused') {
            state_indicator = 'orange';
        }
        
        let trigger = 'data-hx-trigger="load, every 2s"';
        if (state != 'running') {  trigger = 'data-hx-trigger="load"'; }

        let imageVersion = data.Config.Image.split('/');
        let service = imageVersion[imageVersion.length - 1].split(':')[0];
        let ports_list = [];
        try {
        for (const [key, value] of Object.entries(data.HostConfig.PortBindings)) {
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
        

        newCard = newCard.replace(/AppName/g, name);
        newCard = newCard.replace(/AppShortName/g, wrapped);
        newCard = newCard.replace(/AppIcon/g, service);
        newCard = newCard.replace(/AppState/g, data.State.Status);
        newCard = newCard.replace(/AppImage/g, data.Config.Image.split('/'));
        newCard = newCard.replace(/StateColor/g, state_indicator);
        newCard = newCard.replace(/ChartName/g, chartName);
        newCard = newCard.replace(/data-trigger=""/, trigger);

        if (hidden.includes(name)) { newCard = ''; }

        res.send(newCard);
    });
}


function status (state) {
    let status = `<span class="text-yellow align-items-center lh-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon-tabler icon-tabler-point-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"> <path stroke="none" d="M0 0h24v24H0z" fill="none"></path> <path d="M12 7a5 5 0 1 1 -4.995 5.217l-.005 -.217l.005 -.217a5 5 0 0 1 4.995 -4.783z" stroke-width="0" fill="currentColor"></path></svg>
                    ${state}
                </span>`;
    return status;
}

export const Start = (req, res) => {
    let name = req.header('hx-trigger-name');
    let state = req.header('hx-trigger');
    if (state == 'stopped') {
        var containerName = docker.getContainer(name);
        containerName.start();
    } else if (state == 'paused') {
        var containerName = docker.getContainer(name);
        containerName.unpause();
    }

    res.send(status('starting'));
}

export const Stop = (req, res) => {   
    let name = req.header('hx-trigger-name');
    let state = req.header('hx-trigger');
    if (state != 'stopped') {
        var containerName = docker.getContainer(name);
        containerName.stop();
    }
    res.send(status('stopping'));
}

export const Pause = (req, res) => {
    let name = req.header('hx-trigger-name');
    let state = req.header('hx-trigger');
    if (state == 'running') {
        var containerName = docker.getContainer(name);
        containerName.pause();
    } else if (state == 'paused') {
        var containerName = docker.getContainer(name);
        containerName.unpause();
    }
    res.send(status('pausing'));
}

export const Restart = (req, res) => {   
    let name = req.header('hx-trigger-name');
    var containerName = docker.getContainer(name);
    containerName.restart();
    res.send(status('restarting'));
}

export const Logs = (req, res) => {
    let name = req.header('hx-trigger-name');
    function containerLogs (data) {
        return new Promise((resolve, reject) => {
            let logString = '';
            var options = { follow: false, stdout: true, stderr: false, timestamps: false };
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
}

export const Hide = async (req, res) => {
    let name = req.header('hx-trigger-name');
    let exists = await Container.findOne({ where: {name: name}});
    if (!exists) {
        const newContainer = await Container.create({ name: name, visibility: false, });
    } else {
        exists.update({ visibility: false });
    }
    hidden = await Container.findAll({ where: {visibility:false}});
    hidden = hidden.map((container) => container.name);
    res.send("ok");
}

export const Reset = async (req, res) => {
    await Container.update({ visibility: true }, { where: {} });
    hidden = await Container.findAll({ where: {visibility:false}});
    hidden = hidden.map((container) => container.name);
    res.send("ok");
}

export const Modal = async (req, res) => {
    let name = req.header('hx-trigger-name');
    let id = req.header('hx-trigger');

    if (id == 'permissions') {
        // let containerPermissions = await Permission.findAll({ where: {containerName: name}});
        res.send(permissionsModal);
        return;
    }

    if (id == 'uninstall') {
        // let containerPermissions = await Permission.findAll({ where: {containerName: name}});
        res.send(uninstallModal);
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

    let details = detailsModal;
    details = details.replace(/AppName/g, containerInfo.Name.slice(1));
    details = details.replace(/AppImage/g, containerInfo.Config.Image);
    res.send(details);
}