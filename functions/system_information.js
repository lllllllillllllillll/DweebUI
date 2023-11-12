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


        if ((container.Names[0].slice(1) != 'DweebUI') && (container.Names[0].slice(1) != 'DweebCache')) {

            let imageVersion = container.Image.split('/');
            let service = imageVersion[imageVersion.length - 1].split(':')[0];

            let containerId = docker.getContainer(container.Id);
            let containerInfo = await containerId.inspect();

            // Get ports //////////////////////////
            let ports_list = [];
            for (const [key, value] of Object.entries(containerInfo.HostConfig.PortBindings)) {
                let ports = {
                    check : 'checked',
                    external: value[0].HostPort,
                    internal: key.split('/')[0],
                    protocol: key.split('/')[1]
                }
                ports_list.push(ports);
            }
            for (let i = 0; i < 12; i++) {
                if (ports_list[i] == undefined) {
                    let ports = {
                        check : '',
                        external: '',
                        internal: '',
                        protocol: ''
                    }
                    ports_list[i] = ports;
                }
            } /////////////////////////////////////


            // Get volumes ////////////////////////
            let volumes_list = [];
            for (const [key, value] of Object.entries(containerInfo.HostConfig.Binds)) {
                let volumes = {
                    check : 'checked',
                    bind: value.split(':')[0],
                    container: value.split(':')[1],
                    readwrite: value.split(':')[2]
                }
                volumes_list.push(volumes);
            }
            for (let i = 0; i < 12; i++) {
                if (volumes_list[i] == undefined) {
                    let volumes = {
                        check : '',
                        bind: '',
                        container: '',
                        readwrite: ''
                    }
                    volumes_list[i] = volumes;
                }
            } /////////////////////////////////////


            // Get environment variables.
            let environment_variables = [];
            for (const [key, value] of Object.entries(containerInfo.Config.Env)) {
                let env = {
                    check : 'checked',
                    name: value.split('=')[0],
                    default: value.split('=')[1]
                }
                environment_variables.push(env);
            }
            for (let i = 0; i < 12; i++) {
                if (environment_variables[i] == undefined) {
                    let env = {
                        check : '',
                        name: '',
                        default: ''
                    }
                    environment_variables[i] = env;
                }
            }

            // Get labels.
            let labels = [];
            for (const [key, value] of Object.entries(containerInfo.Config.Labels)) {
                let label = {
                    check : 'checked',
                    name: key,
                    value: value
                }
                labels.push(label);
            }
            for (let i = 0; i < 12; i++) {
                if (labels[i] == undefined) {
                    let label = {
                        check : '',
                        name: '',
                        value: ''
                    }
                    labels[i] = label;
                }
            }


            let container_info = {
                name: container.Names[0].slice(1),
                service: service,
                id: container.Id,
                state: container.State,
                image: container.Image,
                external_port: ports_list[0].external || 0,
                internal_port: ports_list[0].internal || 0, 
                ports: ports_list,
                volumes: volumes_list,
                environment_variables: environment_variables,
                labels: labels,
            }

            let dockerCard = dashCard(container_info);

            card_list += dockerCard;
        }
        
    }

    return card_list;
}







module.exports.containerStats = async function () {

    let container_stats = [];

    const data = await docker.listContainers({ all: true });

    for (const container of data) {

        if ((container.Names[0].slice(1) != 'DweebUI') && (container.Names[0].slice(1) != 'DweebCache')) {
            const stats = await dockerContainerStats(container.Id);
            let container_stat = {
                name: container.Names[0].slice(1),
                cpu: Math.round(stats[0].cpuPercent),
                ram: Math.round(stats[0].memPercent)
            }

            //push stats to an array
            container_stats.push(container_stat);
        }
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





