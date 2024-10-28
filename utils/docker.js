import Docker from 'dockerode';
import { dockerContainerStats } from 'systeminformation';
import { Container, ServerSettings } from '../db/config.js'
import stream from 'stream';

export var docker;
var docker2;
var docker3;
var docker4;

if (process.env.DOCKER_HOST && process.env.DOCKER_PORT) {
    console.log('Connecting to Docker with environment variables.');
    docker = new Docker({ host: process.env.DOCKER_HOST, port: process.env.DOCKER_PORT });
    console.log('Docker host connected.');
} else {
    console.log('Connecting to default Docker host.');
    docker = new Docker();
    console.log('Docker host connected.');
}

export async function GetContainerLists(hostid) {

    let host = hostid || 1;

    let containers; 

    if (host == 0) {
        containers = await docker.listContainers({ all: true });
    }

    if ((host == 0) && docker2) {
        let containers2 = await docker2.listContainers({ all: true });
        containers = containers.concat(containers2);
    }

    if ((host == 0) && docker3) {
        let containers3 = await docker3.listContainers({ all: true });
        containers = containers.concat(containers3);
    }

    if ((host == 0) && docker4) {
        let containers4 = await docker4.listContainers({ all: true });
        containers = containers.concat(containers4);
    }

    if (host == 1) {
        containers = await docker.listContainers({ all: true });
    }
    
    if (host == 2 && docker2) {
        containers = await docker2.listContainers({ all: true });
    }

    if (host == 3 && docker3) {
        containers = await docker3.listContainers({ all: true });
    }

    if (host == 4 && docker4) {
        containers = await docker4.listContainers({ all: true });
    }

    return containers;
}



export async function configureHost(hostid, ip, port) {

    if (hostid == 2) {
        docker2 = new Docker({ host: ip, port: port });
        try {
            let containers = await docker2.listContainers({ all: true });
            console.log(`Host 2 connected. ${containers.length} containers found.`);
        }
        catch {
            console.log('Host 2 connection failed.');
            docker2;
        }
    } else if (hostid == 3) {
        docker3 = new Docker({ host: ip, port: port });
        try {
            let containers = await docker3.listContainers({ all: true });
            console.log(`Host 3 connected. ${containers.length} containers found.`);
        }
        catch {
            console.log('Host 3 connection failed.');
            docker3;
        }
    } else if (hostid == 4) {
        docker4 = new Docker({ host: ip, port: port });
        try {
            let containers = await docker4.listContainers({ all: true });
            console.log(`Host 4 connected. ${containers.length} containers found.`);
        }
        catch {
            console.log('Host 4 connection failed.');
            docker4;
        }
    }
}

export async function imageList() {
    let images = await docker.listImages({ all: true });
    return images;
}

export async function volumeList() {
    let volumes = await docker.listVolumes();
    return volumes;
}

export async function networkList() {
    let networks = await docker.listNetworks();
    return networks;
}

export async function GetContainer(containerID) {
    let container = docker.getContainer(containerID);
    return container;
}

export async function containerInfo (containerID) {

    // get the container info
    let info = docker.getContainer(containerID);
    let container = await info.inspect();

    let container_name = container.Name.slice(1);
    let container_image = container.Config.Image;
    let container_service = container.Config.Labels['com.docker.compose.service'];

    let ports_list = [];
    let external = 0;
    let internal = 0;
    
    try {
        for (const [key, value] of Object.entries(container.HostConfig.PortBindings)) {
            let ports = {
                check: 'checked',
                external: value[0].HostPort,
                internal: key.split('/')[0],
                protocol: key.split('/')[1]
            }
            ports_list.push(ports);
        }
    } catch {}

    try { external = ports_list[0].external; internal = ports_list[0].internal; } catch { }

    let container_info = {
        containerName: container_name,
        containerID: containerID,
        containerImage: container_image,
        containerService: container_service,
        containerState: container.State.Status,
        external_port: external,
        internal_port: internal,
        ports: ports_list,
        volumes: container.Mounts,
        env: container.Config.Env,
        labels: container.Config.Labels,
        link: '',
    }

    return container_info;
}


export async function containerLogs(containerID) {
    let container = docker.getContainer(containerID);
    const logs = await container.logs({ stdout: true, stderr: true, tail: 'all', });
    const logsString = logs.toString('utf8');
    return logsString;
}


let available_versions = '';
async function version_check () {
	const resp = await fetch('https://registry.hub.docker.com/v2/namespaces/lllllllillllllillll/repositories/dweebui/tags/?page_size=10000');
    let hub = await resp.json();
    for (let i = 0; i < hub.results.length; i++) {
        available_versions += '| ' + hub.results[i].name + ' ';
    }
    console.log('Available versions:');
    console.log(available_versions);
}
version_check();


// Creates then destroys a docker volume to trigger a docker event.
export async function trigger_docker_event () {
    let volume = await docker.createVolume({ Name: 'dweebui_test_volume' });
    setTimeout(async() => {
        await volume.remove();
    }, 200);
}


export async function containerStats (containerID) {
    const stats = await dockerContainerStats(containerID);
    let info = {
        containerID: containerID,
        cpu: Math.round(stats[0].cpuPercent),
        ram: Math.round(stats[0].memPercent)
    }
    return info;
}



export async function removeNetwork(networkID) {
    let network = docker.getNetwork(networkID);
    await network.remove();
    console.log(`Network ${networkID} removed.`);
}



export async function check_configured_hosts () {

    let [host2, created] = await ServerSettings.findOrCreate({ where: {key: 'host2'}, defaults: { key: 'host2', value: '' } });
    if (host2.value != '') {
        let [tag2, ip2, port2] = host2.value.split(',');
        configureHost(2, ip2, port2);
        console.log('Host 2 configured.');
    }

    let [host3, created3] = await ServerSettings.findOrCreate({ where: {key: 'host3'}, defaults: { key: 'host3', value: '' } });
    if (host3.value != '') {
        let [tag3, ip3, port3] = host3.value.split(',');
        configureHost(3, ip3, port3);
        console.log('Host 3 configured.');
    }

    let [host4, created4] = await ServerSettings.findOrCreate({ where: {key: 'host4'}, defaults: { key: 'host4', value: '' } });
    if (host4.value != '') {
        let [tag4, ip4, port4] = host4.value.split(',');
        configureHost(4, ip4, port4);
        console.log('Host 4 configured.');
    }
}