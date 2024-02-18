import { Readable } from 'stream';
import { Permission, Container } from '../database/models.js';
import { modal } from '../components/modal.js';
import { permissionsModal } from '../components/permissions_modal.js';
import { setEvent, sse, cpu, ram, tx, rx, disk, docker } from '../server.js';
import { dockerContainerStats } from 'systeminformation';
import { containerCard } from '../components/containerCard.js';


export const Dashboard = (req, res) => {
    res.render("dashboard", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.avatar,
    });
}


export const searchDashboard = (req, res) => {
    // console.log(req.params);
    res.render("dashboard", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.avatar,
    });
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

    res.send("ok");
}


export const Stop = (req, res) => {
        
    console.log(`Clicked on stop`);

    let name = req.header('hx-trigger-name');
    let state = req.header('hx-trigger');

    if (state != 'stopped') {
        var containerName = docker.getContainer(name);
        containerName.stop();
    }

    res.send("ok");
}

export const Pause = (req, res) => {
        
    console.log(`Clicked on pause`);

    let name = req.header('hx-trigger-name');
    let state = req.header('hx-trigger');

    if (state == 'running') {
        var containerName = docker.getContainer(name);
        containerName.pause();
    } else if (state == 'paused') {
        var containerName = docker.getContainer(name);
        containerName.unpause();
    }

    res.send("ok");
}

export const Restart = (req, res) => {
        
    console.log(`Clicked on restart`);

    let name = req.header('hx-trigger-name');
    var containerName = docker.getContainer(name);
    containerName.restart();

    res.send("ok");
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
    let id = req.header('hx-trigger');

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



export const Installing = (req, res) => {
    
    let install_info = {
        name: 'App Name',
        service: '',
        id: '',
        state: 'Installing',
        image: '',
        external_port: 0,
        internal_port: 0,
        ports: '',
        link: 'localhost',
    }
    let card = containerCard(install_info);
    res.send(card);
}