import { Readable } from 'stream';
import { Permission, Container } from '../database/models.js';
import { modal } from '../components/modal.js';
import { permissionsModal } from '../components/permissions_modal.js';
import { setEvent, cpu, ram, tx, rx, disk, docker } from '../server.js';
import { dockerContainerStats } from 'systeminformation';
// import { containerCard } from '../components/containerCard.js';
import { readFileSync } from 'fs';

let containerCard = readFileSync('./views/components/containerCard.html', 'utf8');

let [ hidden, cardList ] = [ '', '' ];

export const Dashboard = (req, res) => {
    res.render("dashboard", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.avatar,
    });
}

export const Logs = (req, res) => {
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
}

export const Modal = async (req, res) => {
    let name = req.header('hx-trigger-name');
    let id = req.header('hx-trigger');
    if (id == 'permissions') {
        let containerPermissions = await Permission.findAll({ where: {containerName: name}});
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
}

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


export const Hide = async (req, res) => {
    let name = req.header('hx-trigger-name');
    let exists = await Container.findOne({ where: {name: name}});
    if (!exists) {
        const newContainer = await Container.create({ name: name, visibility: false, });
    } else {
        exists.update({ visibility: false });
    }
    setEvent(true, 'docker');
    res.send("ok");
}

export const Reset = async (req, res) => {
    Container.update({ visibility: true }, { where: {} });
    setEvent(true, 'docker');
    res.send("ok");
}


let stats = {};
export const Chart = async (req, res) => {
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
}

// Get hidden containers
async function getHidden() {
    hidden = await Container.findAll({ where: {visibility:false}});
    hidden = hidden.map((container) => container.name);
}

// Create list of docker containers cards
async function containerCards() {
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
            
            let name = container.Names[0].slice(1);
            let state = container.State;
            
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
          
            let noChart = 'hx-swap="none"';
            if (state == 'running') { noChart = ''; }
          
            let ports_data = [];
            // if (ports) {
            //   ports_data = ports;
            // } else {
            //   for (let i = 0; i < 12; i++) {
          
            //     let port_check = "checked";
            //     let external = i;
            //     let internal = i;
            //     let protocol = "tcp";
          
            //     ports_data.push({
            //       check: port_check,
            //       external: external,
            //       internal: internal,
            //       protocol: protocol
            //     });
            //   }
            // }
          
            let card = containerCard;
            card = card.replace(/AppName/g, name);
            card = card.replace(/AppShortName/g, wrapped);
            card = card.replace(/ChartName/g, chartName);
            card = card.replace(/AppIcon/g, service);
            card = card.replace(/AppState/g, state);
            card = card.replace(/StateColor/g, state_indicator);
            list += card;
        }
    }
    cardList = list;
}




export const Containers = async (req, res) => {
    await getHidden();
    await containerCards();
    res.send(cardList);
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

export const Installs = async (req, res) => {

    let name = req.header('hx-trigger-name');
    let all_containers = '';

    res.send('ok');
   
}