import Docker from 'dockerode';
import { dockerContainerStats } from 'systeminformation';
import { Container, ServerSettings } from '../database/config.js'

// export var docker1 = new Docker();
export var docker = new Docker();
var docker2;
var docker3;
var docker4;

export async function GetContainerLists(hostid) {

    // key: host, value: `${tag3},${ip3},${port3}`

    let host = hostid || 1;

    if (host == 1 || host == 0) {
        let containers = await docker.listContainers({ all: true });
        return containers;
    }

    if (host == 2 && !docker2) { 
        let settings = await ServerSettings.findOne({ where: { key: 'host2' } });
        let ip = settings.value.split(',')[1];
        let port = settings.value.split(',')[2];
        docker2 = new Docker({ host: ip, port: port });
    } else if (host == 2 && docker2) { 
        let containers = await docker2.listContainers({ all: true });
        return containers;
    }

    if (host == 3 && !docker3) {
        let settings = await ServerSettings.findOne({ where: { key: 'host3' } });
        let ip = settings.value.split(',')[1];
        let port = settings.value.split(',')[2];
        docker3 = new Docker({ host: ip, port: port });
    } else if (host == 3 && docker3) {
        let containers = await docker3.listContainers({ all: true });
        return containers;
    }

    if (host == 4 && !docker4) {
        let settings = await ServerSettings.findOne({ where: { key: 'host4' } });
        let ip = settings.value.split(',')[1];
        let port = settings.value.split(',')[2];
        docker4 = new Docker({ host: ip, port: port });
    } else if (host == 4 && docker4) {
        let containers = await docker4.listContainers({ all: true });
        return containers;
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

    // Fetch logs from the container
    const logs = await container.logs({
        stdout: true,
        stderr: true,
        tail: 'all', // or specify a number for the number of lines
    });
    
    const logsString = logs.toString('utf8');

    return logsString;
}


async function version_check () {
	// Fetch the data.
	const resp = await fetch('https://registry.hub.docker.com/v2/namespaces/lllllllillllllillll/repositories/dweebui/tags/?page_size=10000');
    // Parse the JSON.
    let hub = await resp.json();
    console.log('Checking available versions...');
    // Loop through the results.
    for (let i = 0; i < hub.results.length; i++) {
        // Skip version tag if it includes a dash.
        if (hub.results[i].name.includes('-')) { continue; }
        console.log(hub.results[i].name);
    }
}
version_check();


export async function trigger_docker_event () {
    // Create then destroy a docker volume.
    let volume = await docker.createVolume({ Name: 'test_volume' });
    console.log('Manually triggered docker event.');
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




// Loop that runs every 5 seconds to update the container stats.
export async function containerStatsLoop () {

    let containers = await GetContainerLists(1);

    for (let i = 0; i < containers.length; i++) {
        let containerID = containers[i].Id;
        let stats = await containerStats(containerID);

        let container = await Container.findOne({ where: { containerID: containerID } });
        if (!container) {
            container = await Container.create({
                containerName: containers[i].Names[0].slice(1),
                containerID: containerID,
                cpu: JSON.stringify([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                ram: JSON.stringify([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
            });
        }
        else {
            let cpu = JSON.parse(container.cpu);
            cpu.shift();
            cpu.push(stats.cpu);
            let ram = JSON.parse(container.ram);
            ram.shift();
            ram.push(stats.ram);
            container.update({ cpu: JSON.stringify(cpu), ram: JSON.stringify(ram) });
        }
    }
}
setInterval(containerStatsLoop, 5000);

