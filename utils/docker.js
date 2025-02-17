import Docker from 'dockerode';
import { dockerContainerStats } from 'systeminformation';
import { Container, Hosts } from '../db/config.js'

export var docker;
export var docker2;
export var docker3;
export var docker4;
export var docker5;
export var docker6;
export var docker7;
export var docker8;

// Runs once to configure docker hosts
export async function check_configured_hosts () {

    // Check how many entries are in the Hosts table.
    let hosts = await Hosts.findAll();

    if ((hosts.length == 0) && (process.env.DOCKER_HOST && process.env.DOCKER_PORT)) {
        await Hosts.create({ state: 'enabled', host: process.env.DOCKER_HOST, port: process.env.DOCKER_PORT, protocol: 'http', tag: 'Host 1' });
    }
    else if (hosts.length == 0) {
        await Hosts.create({ state: 'enabled', host: '/var/run/docker.sock', port: '', protocol: 'http', tag: 'Host 1' });
    }

    hosts = await Hosts.findAll();
    
    // console.log(`Found ${hosts.length} entries in the Hosts table.`);

    // Configure each host.
    for (let i = 0; i < hosts.length; i++) {
        let host = hosts[i];
        if (host.state != 'enabled') { continue; }
        configureHost(host.id, host.host, host.port, host.protocol, host.tag);
    }
}


export async function configureHost(id, host, port, protocol, tag) {

    console.log(`Configuring host #${id} with ${host} and port ${port}.`);

    if ((id == 1) && (host == '/var/run/docker.sock')) {
        docker = new Docker();

        setTimeout(async () => {
            console.log('Attempting to connect to host 1...');
            let containers = await docker.listContainers({ all: true });
            console.log(`Host 1 connected. ${containers.length} containers found.`);
        }, 2000);
    } 

    else if (id == 1) {
        docker = new Docker({ host: host, port: port });

        setTimeout(async () => {
            console.log('Attempting to connect to host 1...');
            let containers = await docker.listContainers({ all: true });
            console.log(`Host 1 connected. ${containers.length} containers found.`);
        }, 2000);
    }

    else if (id == 2) {
        docker2 = new Docker({ host: host, port: port });

        setTimeout(async () => {
            console.log('Attempting to connect to host 2...');
            let containers = await docker2.listContainers({ all: true });
            console.log(`Host 2 connected. ${containers.length} containers found.`);
        }, 2000);
    } 

    else if (id == 3) {
        docker3 = new Docker({ host: host, port: port });

        setTimeout(async () => {
            console.log('Attempting to connect to host 3...');
            let containers = await docker3.listContainers({ all: true });
            console.log(`Host 3 connected. ${containers.length} containers found.`);
        }, 2000);
    } 

    else if (id == 4) {
        docker4 = new Docker({ host: host, port: port });

        setTimeout(async () => {
            console.log('Attempting to connect to host 4...');
            let containers = await docker4.listContainers({ all: true });
            console.log(`Host 4 connected. ${containers.length} containers found.`);
        }, 2000);
    }
}



export async function GetContainerLists(hostid) {

    let host = hostid || 1;
    let containers; 
    let hosts = await Hosts.findAll();

    // If host is 0, get all containers from each host that has state = 'enabled'.
    if (host == 0) {
        containers = await docker.listContainers({ all: true });
        for (let i = 1; i < hosts.length; i++) {
            if (hosts[i].state == 'enabled') {
                let host_containers = await docker.listContainers({ all: true });
                containers = containers.concat(host_containers);
            }
        }
    }

    if (host == 1) {
        containers = await docker.listContainers({ all: true });
    }

    if (host == 2) {
        containers = await docker2.listContainers({ all: true });
    }

    if (host == 3) {
        containers = await docker3.listContainers({ all: true });
    }

    if (host == 4) {
        containers = await docker4.listContainers({ all: true });
    }

    if (host == 5) {
        containers = await docker5.listContainers({ all: true });
    }

    if (host == 6) {
        containers = await docker6.listContainers({ all: true });
    }

    if (host == 7) {
        containers = await docker7.listContainers({ all: true });
    }

    if (host == 8) {
        containers = await docker8.listContainers({ all: true });
    }

    return containers;
}


export async function imageList(hostID) {
    
    let host = hostID || 1;

    let images; 

    if (host == 0) {
        images = await docker.listImages({ all: true });
    }

    if ((host == 0) && docker2) {
        let images2 = await docker2.listImages({ all: true });
        images = images.concat(images2);
    }

    if ((host == 0) && docker3) {
        let images3 = await docker3.listImages({ all: true });
        images = images.concat(images3);
    }

    if ((host == 0) && docker4) {
        let images4 = await docker4.listImages({ all: true });
        images = images.concat(images4);
    }

    if (host == 1) {
        images = await docker.listImages({ all: true });
    }
    
    if (host == 2 && docker2) {
        images = await docker2.listImages({ all: true });
    }

    if (host == 3 && docker3) {
        images = await docker3.listImages({ all: true });
    }

    if (host == 4 && docker4) {
        images = await docker4.listImages({ all: true });
    }

    return images;
}

export async function removeImage(imageID, hostID) {
        
    let host = hostID || 1;
    let image_name = '';

    if (host == 0) {
        try {
            let image = docker.getImage(imageID);
            let info = await image.inspect();
            image_name = info.RepoTags[0];
            await image.remove();
            console.log(`Image ${image_name} removed from host 1.`);
        } catch { console.log(`Image ${image_name} not found on host 1.`); }

        try {
            let image2 = docker2.getImage(imageID);
            let info = await image2.inspect();
            image_name = info.RepoTags[0];
            await image2.remove();
            console.log(`Image ${image_name} removed from host 2.`);
        } catch { console.log(`Image ${image_name} not found on host 2.`); }

        try {
            let image3 = docker3.getImage(imageID);
            image3 = await image3.inspect();
            image_name = image3.RepoTags[0];
            await image3.remove();
            console.log(`Image ${image_name} removed from host 3.`);
        } catch { console.log(`Image ${image_name} not found on host 3.`); }

        try {
            let image4 = docker4.getImage(imageID);
            image4 = await image4.inspect();
            image_name = image4.RepoTags[0];
            await image4.remove();
            console.log(`Image ${image_name} removed from host 4.`);
        } catch { console.log(`Image ${image_name} not found on host 4.`); }
    }

    if (host == 1) {
        try {
            let image = docker.getImage(imageID);
            let info = await image.inspect();
            image_name = info.RepoTags[0];
            await image.remove();
            console.log(`Image ${image_name} removed from host 1.`);
        } catch { console.log(`Image ${image_name} not found on host 1.`); }
    }

    if (host == 2) {
        try {
            let image = docker2.getImage(imageID);
            image = await image.inspect();
            image_name = image.RepoTags[0];
            await image.remove();
            console.log(`Image ${image_name} removed from host 2.`);
        } catch { console.log(`Image ${image_name} not found on host 2.`); }
    }

    if (host == 3) {
        try {
            let image = docker3.getImage(imageID);
            image = await image.inspect();
            image_name = image.RepoTags[0];
            await image.remove();
            console.log(`Image ${image_name} removed from host 3.`);
        } catch { console.log(`Image ${image_name} not found on host 3.`); }
    }

    if (host == 4) {
        try {
            let image = docker4.getImage(imageID);
            image = await image.inspect();
            image_name = image.RepoTags[0];
            await image.remove();
            console.log(`Image ${image_name} removed from host 4.`);
        } catch { console.log(`Image ${image_name} not found on host 4.`); }
    }

}


export async function imagePull(image, tag, hostID) {

    console.log('[Image Pull]');
    console.log(`Pulling image ${image}:${tag} on host ${hostID}.`);
    console.log('Pull not yet implemented.');
}



export async function volumeList(hostid) {
    
    let host = hostid || 1;

    let volumes; 

    if (host == 0) {
        volumes = await docker.listVolumes();
    }

    if ((host == 0) && docker2) {
        let volumes2 = await docker2.listVolumes();
        volumes = volumes.concat(volumes2);
    }

    if ((host == 0) && docker3) {
        let volumes3 = await docker3.listVolumes();
        volumes = volumes.concat(volumes3);
    }

    if ((host == 0) && docker4) {
        let volumes4 = await docker4.listVolumes();
        volumes = volumes.concat(volumes4);
    }

    if (host == 1) {
        volumes = await docker.listVolumes();
    }
    
    if (host == 2 && docker2) {
        volumes = await docker2.listVolumes();
    }

    if (host == 3 && docker3) {
        volumes = await docker3.listVolumes();
    }

    if (host == 4 && docker4) {
        volumes = await docker4.listVolumes();
    }

    return volumes;
}


export async function networkList(hostid) {
        
    let host = hostid || 1;

    let networks; 

    if (host == 0) {
        networks = await docker.listNetworks();
    }

    if ((host == 0) && docker2) {
        let networks2 = await docker2.listNetworks();
        networks = networks.concat(networks2);
    }

    if ((host == 0) && docker3) {
        let networks3 = await docker3.listNetworks();
        networks = networks.concat(networks3);
    }

    if ((host == 0) && docker4) {
        let networks4 = await docker4.listNetworks();
        networks = networks.concat(networks4);
    }

    if (host == 1) {
        networks = await docker.listNetworks();
    }
    
    if (host == 2 && docker2) {
        networks = await docker2.listNetworks();
    }

    if (host == 3 && docker3) {
        networks = await docker3.listNetworks();
    }

    if (host == 4 && docker4) {
        networks = await docker4.listNetworks();
    }

    return networks;
}


export async function containerInfo (containerID) {
    
    let container;
    let host;

    try { container = docker.getContainer(containerID); host = 1; } catch {}
    try { container = docker2.getContainer(containerID); host = 2; } catch {}
    try { container = docker3.getContainer(containerID); host = 3; } catch {}
    try { container = docker4.getContainer(containerID); host = 4; } catch {}
    
    container = await container.inspect();

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

    // Make sure there is an entry in the database for this container.
    await Container.findOrCreate({ where: { containerID: containerID }, defaults: { containerName: container_name, containerID: containerID, link: '', cpu: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', ram: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', host: host } });

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



// Creates then destroys a docker volume to trigger a docker event.
export async function trigger_docker_event () {
    let volume = await docker.createVolume({ Name: 'dweebui_event_trigger' });
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



export async function removeNetwork(networkID, hostID) {
    let host = hostID || 1;

    if (host == 0) {
        try {
            let network = docker.getNetwork(networkID);
            await network.remove();
            console.log(`Network ${networkID} removed from host 1.`);
        } catch { console.log(`Network ${networkID} not found on host 1.`); }

        try {
            let network2 = docker2.getNetwork(networkID);
            await network2.remove();
            console.log(`Network ${networkID} removed from host 2.`);
        } catch { console.log(`Network ${networkID} not found on host 2.`); }

        try {
            let network3 = docker3.getNetwork(networkID);
            await network3.remove();
            console.log(`Network ${networkID} removed from host 3.`);
        } catch { console.log(`Network ${networkID} not found on host 3.`); }

        try {
            let network4 = docker4.getNetwork(networkID);
            await network4.remove();
            console.log(`Network ${networkID} removed from host 4.`);
        } catch { console.log(`Network ${networkID} not found on host 4.`); }
    }

    if (host == 1) {
        let network = docker.getNetwork(networkID);
        await network.remove();
        console.log(`Network ${networkID} removed from host 1.`);
    }

    if (host == 2) {
        let network = docker2.getNetwork(networkID);
        await network.remove();
        console.log(`Network ${networkID} removed from host 2.`);
    }

    if (host == 3) {
        let network = docker3.getNetwork(networkID);
        await network.remove();
        console.log(`Network ${networkID} removed from host 3.`);
    }
}

export async function removeVolume(volumeName, hostID) {

    let host = hostID || 1;
    let volume;
    let results = 0;

    console.log(volumeName);
    console.log(host);

    if (host == 0) {

        // Check each host for the volume.
        try {
            volume = docker.getVolume(volumeName);
            results++;
        } catch { console.log(`Volume ${volumeName} not found on host 1.`); }

        try {
            volume = docker2.getVolume(volumeName);
            results++;
        } catch { console.log(`Volume ${volumeName} not found on host 2.`); }

        try {
            volume = docker3.getVolume(volumeName);
            results++;
        } catch { console.log(`Volume ${volumeName} not found on host 3.`); }

        try {
            volume = docker4.getVolume(volumeName);
            results++;
        } catch { console.log(`Volume ${volumeName} not found on host 4.`); }

        // Make sure there is only one result.
        if (results > 1) {
            console.log(`Found volume with name ${volumeName} on multiple hosts. Cancelling action.`);
        }
        else if (results == 0) {
            console.log(`Volume ${volumeName} not found on any host.`);
        }
        else if (results == 1) {
            await volume.remove();
            console.log(`Volume ${volumeName} removed.`);
        }
    }

    if (host == 1) {
        volume = docker.getVolume(volumeName);
        console.log(`Removing volume ${volumeName} from host 1.`);
        await volume.remove();
    }
    else if (host == 2) {
        volume = docker2.getVolume(volumeName);
        console.log(`Removing volume ${volumeName} from host 2.`);
        await volume.remove();
    }
    else if (host == 3) {
        volume = docker3.getVolume(volumeName);
        console.log(`Removing volume ${volumeName} from host 3.`);
        await volume.remove();
    }
    else if (host == 4) {
        volume = docker4.getVolume(volumeName);
        console.log(`Removing volume ${volumeName} from host 4.`);
        await volume.remove();
    }
    console.log(`Volume ${volumeName} removed.`);
}

let available_versions = '';
async function version_check () {
	const resp = await fetch('https://registry.hub.docker.com/v2/namespaces/lllllllillllllillll/repositories/dweebui/tags/?page_size=10000');
    let hub = await resp.json();
    for (let i = 0; i < hub.results.length; i++) {
        available_versions += '| ' + hub.results[i].name + ' ';
    }
    console.log(`\x1b[33mAvailable versions: ${available_versions}\x1b[0m`);
}
// version_check();
