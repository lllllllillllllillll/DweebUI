import Docker from 'dockerode';
import { Readable } from 'stream';

export var docker = new Docker();

export async function containerList() {
    let containers = await docker.listContainers({ all: true });
    return containers;
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

export async function getContainer(containerID) {
    let container = docker.getContainer(containerID);
    return container;
}

export async function containerInspect (containerID) {
    // get the container info
    let container = docker.getContainer(containerID);
    let info = await container.inspect();
    let image = info.Config.Image;
    let container_id = info.Id;
    
    let service = info.Config.Labels['com.docker.compose.service'];

    let ports_list = [];
    let external = 0;
    let internal = 0;
    
    try {
        for (const [key, value] of Object.entries(info.HostConfig.PortBindings)) {
            let ports = {
                check: 'checked',
                external: value[0].HostPort,
                internal: key.split('/')[0],
                protocol: key.split('/')[1]
            }
            ports_list.push(ports);
        }
    } catch {}
    try {
        external = ports_list[0].external;
        internal = ports_list[0].internal;
    } catch {}

    let details = {
        name: info.Name.slice(1),
        image: image,
        service: service,
        containerID: container_id,
        state: info.State.Status,
        external_port: external,
        internal_port: internal,
        ports: ports_list,
        volumes: info.Mounts,
        env: info.Config.Env,
        labels: info.Config.Labels,
        link: 'localhost',
    }
    return details;
}

export async function containerLogs(containerID) {

    let logString = '';
    let options = { follow: false, stdout: true, stderr: false, timestamps: true };

    let container = docker.getContainer(containerID);
    let logs = await container.logs(options);

    let readable = new Readable();
    readable._read = () => {};
    readable.push(logs);
    readable.push(null);

    readable.on('data', (chunk) => {
        logString += chunk.toString();
    });

    return new Promise((resolve, reject) => {
        readable.on('end', () => {
            resolve(logString);
        });
    });
}

