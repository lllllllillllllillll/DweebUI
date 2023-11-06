const { currentLoad, mem, networkStats, fsSize, dockerContainerStats } = require('systeminformation');
var Docker = require('dockerode');
var docker = new Docker({ socketPath: '/var/run/docker.sock' });
const { dashCard } = require('../components/dashCard');

// export docker
module.exports.docker = docker;

module.exports.serverStats = async function () {
    const cpuUsage = await currentLoad();
    const ramUsage = await mem();
    const netUsage = await networkStats();
    const diskUsage = await fsSize();

    const info = {
        cpu: Math.round(cpuUsage.currentLoad),
        ram: Math.round((ramUsage.active / ramUsage.total) * 100),
        tx: netUsage[0].tx_bytes,
        rx: netUsage[0].rx_bytes,
        disk: diskUsage[0].use,
    };

    return info;
}



module.exports.containerList = async function () {
    let card_list = '';

    const data = await docker.listContainers({ all: true });
    for (const container of data) {
        let imageVersion = container.Image.split('/');
        let service = imageVersion[imageVersion.length - 1].split(':')[0];

        let containerId = docker.getContainer(container.Id);
        let containerInfo = await containerId.inspect();

        let open_ports = [];
        let external_port = 0;
        let internal_port = 0;

        for (const [key, value] of Object.entries(containerInfo.HostConfig.PortBindings)) {
            open_ports.push(`${value[0].HostPort}`);
            external_port = value[0].HostPort;
            internal_port = key;

            if ((external_port == undefined) || (internal_port == undefined)) {
                external_port = 0;
                internal_port = 0;
            }
        }

        let volumes = [];
        for (const [key, value] of Object.entries(containerInfo.Mounts)) {
            volumes.push(`${value.Source}: ${value.Destination}: ${value.RW}`);
        }

        let environment_variables = [];
        for (const [key, value] of Object.entries(containerInfo.Config.Env)) {
            environment_variables.push(`${key}: ${value}`);
        }

        let labels = [];
        for (const [key, value] of Object.entries(containerInfo.Config.Labels)) {
            labels.push(`${key}: ${value}`);
        }


        let container_info = {
            name: container.Names[0].slice(1),
            service: service,
            id: container.Id,
            state: container.State,
            image: container.Image,
            external_port: external_port,
            internal_port: internal_port
        }

        let dockerCard = dashCard(container_info);
        card_list += dockerCard;
        
    }

    return card_list;
}







module.exports.containerStats = async function () {

    let container_stats = [];

    const data = await docker.listContainers({ all: true });

    for (const container of data) {

        const stats = await dockerContainerStats(container.Id);
        let container_stat = {
            name: container.Names[0].slice(1),
            cpu: Math.round(stats[0].cpuPercent),
            ram: Math.round(stats[0].memPercent)
        }

        //push stats to an array
        container_stats.push(container_stat);
    }
    return container_stats;
}






module.exports.containerAction = async function (data) {

    let { user, role, action, container, state } = data;

    console.log(`${user} wants to: ${action} ${container}`);
    
    if (role == 'admin') {
        var containerName = docker.getContainer(container);

        if ((action == 'start') && (state == 'stopped')) {
            containerName.start();
        } else if ((action == 'start') && (state == 'paused')) {
            containerName.unpause();
        } else if ((action == 'stop') && (state != 'stopped')) {
            containerName.stop();
        } else if ((action == 'pause') && (state == 'running')) {
            containerName.pause();
        } else if ((action == 'pause') && (state == 'paused')) {
            containerName.unpause();
        } else if (action == 'restart') {
            containerName.restart();
        }
    } else {
        console.log('User is not an admin');
    }
}





