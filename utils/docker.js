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



export async function check_configured_hosts () {
    // Get list of hosts.
    let hosts = await Hosts.findAll();
    // Create an entry in the Hosts table if no entries are found.
    if ((hosts.length == 0) && (process.env.DOCKER_HOST && process.env.DOCKER_PORT)) { await Hosts.create({ state: 'enabled', host: process.env.DOCKER_HOST, port: process.env.DOCKER_PORT, protocol: 'http', tag: 'Host 1' }); }
    else if (hosts.length == 0) { await Hosts.create({ state: 'enabled', host: '/var/run/docker.sock', port: '', protocol: 'http', tag: 'Host 1' }); }
    // Update the list of hosts.
    hosts = await Hosts.findAll();
    // Configure each host.
    for (let i = 0; i < hosts.length; i++) {
        // Skip if not enabled.
        if (hosts[i].state != 'enabled') { continue; }
        configureHost(hosts[i].id, hosts[i].host, hosts[i].port, hosts[i].protocol, hosts[i].tag);
    }
}


export async function configureHost(id, host, port, protocol, tag) {

    console.log(`Configuring host #${id} with ${host} and port ${port}.`);

    if ((id == 1) && (host == '/var/run/docker.sock')) {
        let host1 = await Hosts.findOne({ where: { id: 1 } });
        host1.connected = 'false';
        await host1.save();

        docker = new Docker();

        setTimeout(async () => {
            console.log('Attempting to connect to host 1...');
            try {
                let containers = await docker.listContainers({ all: true });
                console.log(`Host 1 connected. ${containers.length} containers found.`);

                for (const container of containers) {
                    await Container.findOrCreate({ where: { containerID: container.Id }, defaults: { containerName: container.Names[0].slice(1), containerID: container.Id, link: '', cpu: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', ram: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', host: 1 } });
                }

                host1.connected = 'true';
                await host1.save();
            } catch { console.log('\x1b[31m Host 1 connection FAILED \x1b[0m'); }
        }, 2000);
    } 

    else if (id == 1) {
        let host1 = await Hosts.findOne({ where: { id: 1 } });
        host1.connected = 'false';
        await host1.save();

        docker = new Docker({ host: host, port: port });

        setTimeout(async () => {
            console.log('Attempting to connect to host 1...');
            try {
                let containers = await docker.listContainers({ all: true });
                console.log(`Host 1 connected. ${containers.length} containers found.`);

                for (const container of containers) {
                    await Container.findOrCreate({ where: { containerID: container.Id }, defaults: { containerName: container.Names[0].slice(1), containerID: container.Id, link: '', cpu: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', ram: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', host: 1 } });
                }

                host1.connected = 'true';
                await host1.save();
            } catch { console.log('\x1b[31m Host 1 connection FAILED \x1b[0m'); }
        }, 2000);
    }

    else if (id == 2) {

        // Find host2 in the database and set the 'connected' field to 'false'
        let host2 = await Hosts.findOne({ where: { id: 2 } });
        host2.connected = 'false';
        await host2.save();

        docker2 = new Docker({ host: host, port: port });

        setTimeout(async () => {
            console.log('Attempting to connect to host 2...');
            try {
                let containers = await docker2.listContainers({ all: true });
                console.log(`Host 2 connected. ${containers.length} containers found.`);

                for (const container of containers) {
                    await Container.findOrCreate({ where: { containerID: container.Id }, defaults: { containerName: container.Names[0].slice(1), containerID: container.Id, link: '', cpu: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', ram: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', host: 2 } });
                }

                // Find host2 in the database and set the 'connected' field to 'true'
                host2.connected = 'true';
                await host2.save();
            } catch { console.log('\x1b[31m Host 2 connection FAILED \x1b[0m'); }
        }, 2000);

    } 

    else if (id == 3) {
        
        let host3 = await Hosts.findOne({ where: { id: 3 } });
        host3.connected = 'false';
        await host3.save();

        docker3 = new Docker({ host: host, port: port });

        setTimeout(async () => {
            console.log('Attempting to connect to host 3...');
            try {
                let containers = await docker3.listContainers({ all: true });
                console.log(`Host 3 connected. ${containers.length} containers found.`);

                for (const container of containers) {
                    await Container.findOrCreate({ where: { containerID: container.Id }, defaults: { containerName: container.Names[0].slice(1), containerID: container.Id, link: '', cpu: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', ram: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', host: 3 } });
                }

                host3.connected = 'true';
                await host3.save();
            } catch { console.log('\x1b[31m Host 3 connection FAILED \x1b[0m'); }
        }, 2000);
    }

    else if (id == 4) {
        
        let host4 = await Hosts.findOne({ where: { id: 4 } });
        host4.connected = 'false';
        await host4.save();

        docker4 = new Docker({ host: host, port: port });

        setTimeout(async () => {
            console.log('Attempting to connect to host 4...');
            try {
                let containers = await docker4.listContainers({ all: true });
                console.log(`Host 4 connected. ${containers.length} containers found.`);

                for (const container of containers) {
                    await Container.findOrCreate({ where: { containerID: container.Id }, defaults: { containerName: container.Names[0].slice(1), containerID: container.Id, link: '', cpu: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', ram: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', host: 4 } });
                }

                host4.connected = 'true';
                await host4.save();
            } catch { console.log('\x1b[31m Host 4 connection FAILED \x1b[0m'); }
        }, 2000);
    }

    else if (id == 5) {
        
        let host5 = await Hosts.findOne({ where: { id: 5 } });
        host5.connected = 'false';
        await host5.save();

        docker5 = new Docker({ host: host, port: port });

        setTimeout(async () => {
            console.log('Attempting to connect to host 5...');
            try {
                let containers = await docker5.listContainers({ all: true });
                console.log(`Host 5 connected. ${containers.length} containers found.`);

                for (const container of containers) {
                    await Container.findOrCreate({ where: { containerID: container.Id }, defaults: { containerName: container.Names[0].slice(1), containerID: container.Id, link: '', cpu: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', ram: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', host: 5 } });
                }

                host5.connected = 'true';
                await host5.save();
            } catch { console.log('\x1b[31m Host 5 connection FAILED \x1b[0m'); }
        }, 2000);
    }

    else if (id == 6) {
        
        let host6 = await Hosts.findOne({ where: { id: 6 } });
        host6.connected = 'false';
        await host6.save();

        docker6 = new Docker({ host: host, port: port });

        setTimeout(async () => {
            console.log('Attempting to connect to host 6...');
            try {
                let containers = await docker6.listContainers({ all: true });
                console.log(`Host 6 connected. ${containers.length} containers found.`);

                for (const container of containers) {
                    await Container.findOrCreate({ where: { containerID: container.Id }, defaults: { containerName: container.Names[0].slice(1), containerID: container.Id, link: '', cpu: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', ram: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', host: 6 } });
                }

                host6.connected = 'true';
                await host6.save();
            } catch { console.log('\x1b[31m Host 6 connection FAILED \x1b[0m'); }
        }, 2000);
    }

    else if (id == 7) {
        
        let host7 = await Hosts.findOne({ where: { id: 7 } });
        host7.connected = 'false';
        await host7.save();

        docker7 = new Docker({ host: host, port: port });

        setTimeout(async () => {
            console.log('Attempting to connect to host 7...');
            try {
                let containers = await docker7.listContainers({ all: true });
                console.log(`Host 7 connected. ${containers.length} containers found.`);

                for (const container of containers) {
                    await Container.findOrCreate({ where: { containerID: container.Id }, defaults: { containerName: container.Names[0].slice(1), containerID: container.Id, link: '', cpu: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', ram: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', host: 7 } });
                }

                host7.connected = 'true';
                await host7.save();
            } catch { console.log('\x1b[31m Host 7 connection FAILED \x1b[0m'); }
        }, 2000);
    }

    else if (id == 8) {
        
        let host8 = await Hosts.findOne({ where: { id: 8 } });
        host8.connected = 'false';
        await host8.save();

        docker8 = new Docker({ host: host, port: port });

        setTimeout(async () => {
            console.log('Attempting to connect to host 8...');
            try {
                let containers = await docker8.listContainers({ all: true });
                console.log(`Host 8 connected. ${containers.length} containers found.`);

                for (const container of containers) {
                    await Container.findOrCreate({ where: { containerID: container.Id }, defaults: { containerName: container.Names[0].slice(1), containerID: container.Id, link: '', cpu: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', ram: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', host: 8 } });
                }

                host8.connected = 'true';
                await host8.save();
            } catch { console.log('\x1b[31m Host 8 connection FAILED \x1b[0m'); }
        }, 2000);
    }
}



export async function GetContainerLists(hostid) {

    let host = hostid || 1;
    let containers; 

    console.log(`[GetContainerLists] Host: ${host}`);

    // If host is 0, get all containers from each host that has state = 'enabled'.
    if (host == 0) {

        let hosts = await Hosts.findAll();

        for ( const host of hosts ) {

            if (host.id == 1 && host.state == 'enabled') {
                containers = await docker.listContainers({ all: true });
            }

            if (host.id == 2 && host.state == 'enabled') {
                let containers2 = await docker2.listContainers({ all: true });
                containers = containers.concat(containers2);

            }

            if (host.id == 3 && host.state == 'enabled') {
                let containers3 = await docker3.listContainers({ all: true });
                containers = containers.concat(containers3);
            }

            if (host.id == 4 && host.state == 'enabled') {
                let containers4 = await docker4.listContainers({ all: true });
                containers = containers.concat(containers4);
            }

            if (host.id == 5 && host.state == 'enabled') {
                let containers5 = await docker5.listContainers({ all: true });
                containers = containers.concat(containers5);
            }

            if (host.id == 6 && host.state == 'enabled') {
                let containers6 = await docker6.listContainers({ all: true });
                containers = containers.concat(containers6);
            }

            if (host.id == 7 && host.state == 'enabled') {
                let containers7 = await docker7.listContainers({ all: true });
                containers = containers.concat(containers7);
            }

            if (host.id == 8 && host.state == 'enabled') {
                let containers8 = await docker8.listContainers({ all: true });
                containers = containers.concat(containers8);
            }
           
        }
    }

    if (host == 1) {
        containers = await docker.listContainers({ all: true });
        for (let i = 0; i < containers.length; i++) {
            let container = containers[i];
            await Container.findOrCreate({ where: { containerID: container.Id }, defaults: { containerName: container.Names[0].slice(1), containerID: container.Id, link: '', cpu: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', ram: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', host: 1 } });
        }
    }

    if (host == 2) {
        containers = await docker2.listContainers({ all: true });
        for (let i = 0; i < containers.length; i++) {
            let container = containers[i];
            await Container.findOrCreate({ where: { containerID: container.Id }, defaults: { containerName: container.Names[0].slice(1), containerID: container.Id, link: '', cpu: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', ram: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', host: 2 } });
        }
    }

    if (host == 3) {
        containers = await docker3.listContainers({ all: true });
        for (let i = 0; i < containers.length; i++) {
            let container = containers[i];
            await Container.findOrCreate({ where: { containerID: container.Id }, defaults: { containerName: container.Names[0].slice(1), containerID: container.Id, link: '', cpu: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', ram: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', host: 3 } });
        }
    }

    if (host == 4) {
        containers = await docker4.listContainers({ all: true });
        for (let i = 0; i < containers.length; i++) {
            let container = containers[i];
            await Container.findOrCreate({ where: { containerID: container.Id }, defaults: { containerName: container.Names[0].slice(1), containerID: container.Id, link: '', cpu: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', ram: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', host: 4 } });
        }
    }

    if (host == 5) {
        containers = await docker5.listContainers({ all: true });
        for (let i = 0; i < containers.length; i++) {
            let container = containers[i];
            await Container.findOrCreate({ where: { containerID: container.Id }, defaults: { containerName: container.Names[0].slice(1), containerID: container.Id, link: '', cpu: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', ram: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', host: 5 } });
        }
    }

    if (host == 6) {
        containers = await docker6.listContainers({ all: true });
        for (let i = 0; i < containers.length; i++) {
            let container = containers[i];
            await Container.findOrCreate({ where: { containerID: container.Id }, defaults: { containerName: container.Names[0].slice(1), containerID: container.Id, link: '', cpu: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', ram: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', host: 6 } });
        }
    }

    if (host == 7) {
        containers = await docker7.listContainers({ all: true });
        for (let i = 0; i < containers.length; i++) {
            let container = containers[i];
            await Container.findOrCreate({ where: { containerID: container.Id }, defaults: { containerName: container.Names[0].slice(1), containerID: container.Id, link: '', cpu: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', ram: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', host: 7 } });
        }
    }

    if (host == 8) {
        containers = await docker8.listContainers({ all: true });
        for (let i = 0; i < containers.length; i++) {
            let container = containers[i];
            await Container.findOrCreate({ where: { containerID: container.Id }, defaults: { containerName: container.Names[0].slice(1), containerID: container.Id, link: '', cpu: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', ram: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', host: 8 } });
        }
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

    console.log(`Getting info for container ${containerID}.`);
    
    let container;
    
    // Find the container's host, which is saved in the GetContainerLists function.
    let container_host = await Container.findOne({ where: { containerID: containerID } });
        container_host = container_host.host;

    if (container_host == 1) { container = docker.getContainer(containerID); }
    else if (container_host == 2) { container = docker2.getContainer(containerID); }
    else if (container_host == 3) { container = docker3.getContainer(containerID); }
    else if (container_host == 4) { container = docker4.getContainer(containerID); }
    else if (container_host == 5) { container = docker5.getContainer(containerID); }
    else if (container_host == 6) { container = docker6.getContainer(containerID); }
    else if (container_host == 7) { container = docker7.getContainer(containerID); }
    else if (container_host == 8) { container = docker8.getContainer(containerID); }

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

    let container;
    let logsString = '';

    let container_host = await Container.findOne({ where: { containerID: containerID } });
        container_host = container_host.host;

    if (container_host == 1) { container = docker.getContainer(containerID); }
    else if (container_host == 2) { container = docker2.getContainer(containerID); }
    else if (container_host == 3) { container = docker3.getContainer(containerID); }
    else if (container_host == 4) { container = docker4.getContainer(containerID); }
    else if (container_host == 5) { container = docker5.getContainer(containerID); }
    else if (container_host == 6) { container = docker6.getContainer(containerID); }
    else if (container_host == 7) { container = docker7.getContainer(containerID); }
    else if (container_host == 8) { container = docker8.getContainer(containerID); }

    const logs = await container.logs({ stdout: true, stderr: true, tail: 'all', });
    logsString = logs.toString('utf8');
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
