import Docker from 'dockerode';

export var docker = new Docker();


export async function imageList() {
    let images = await docker.listImages({ all: true });
    return images;
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