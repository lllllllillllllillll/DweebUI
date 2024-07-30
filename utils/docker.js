import Docker from 'dockerode';
import { Permission } from '../database/config.js';

export var docker = new Docker();

export async function containerList() {
    let containers = await docker.listContainers({ all: true });
    containers = containers.map(container => ({ 
        containerName: container.Names[0].split('/').pop(),
        containerID: container.Id,
        containerState: container.State,
        containerImage: container.Image,
    }));
    return containers;
}

export async function imageList() {
    let images = await docker.listImages({ all: true });
    return images;
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


export const containerAction = async (req, res) => {

    let container_name = req.header('hx-trigger-name');
    let container_id = req.header('hx-trigger');
    let action = req.params.action;

    console.log(`Container: ${container_name} ID: ${container_id} Action: ${action}`);

    // Reset the view
    if (container_id == 'reset') { 
        console.log('Resetting view'); 
        await Permission.update({ hide: false }, { where: { userID: req.session.userID } });
        res.send('ok'); 
        return;
    }
    // Inspect the container
    let container = docker.getContainer(container_id);
    let containerInfo = await container.inspect();
    let state = containerInfo.State.Status;
    // console.log(`Container: ${container_name} ID: ${container_id} State: ${state} Action: ${action}`);
    // Displays container state (starting, stopping, restarting, pausing)
    function status (state) {
        return(`<span class="text-yellow align-items-center lh-1"><svg xmlns="http://www.w3.org/2000/svg" class="icon-tabler icon-tabler-point-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"> <path stroke="none" d="M0 0h24v24H0z" fill="none"></path> <path d="M12 7a5 5 0 1 1 -4.995 5.217l-.005 -.217l.005 -.217a5 5 0 0 1 4.995 -4.783z" stroke-width="0" fill="currentColor"></path></svg>
                        ${state}
                </span>`);
    }
    // Perform the action
    if ((action == 'start') && (state == 'exited')) {
        await container.start();
        res.send(status('starting'));
    } else if ((action == 'start') && (state == 'paused')) {
        await container.unpause();
        res.send(status('starting'));
    } else if ((action == 'stop') && (state != 'exited')) {
        await container.stop();
        res.send(status('stopping'));
    } else if ((action == 'pause') && (state == 'paused')) {
        await container.unpause();
        res.send(status('starting'));
    }   else if ((action == 'pause') && (state == 'running')) {
        await container.pause();
        res.send(status('pausing'));
    } else if (action == 'restart') {
        await container.restart();
        res.send(status('restarting'));
    } else if (action == 'hide') {
        let exists = await Permission.findOne({ where: { containerID: container_id, userID: req.session.userID }});
        if (!exists) { const newPermission = await Permission.create({ containerName: container_name, containerID: container_id, username: req.session.username, userID: req.session.userID, hide: true }); }
        else { exists.update({ hide: true }); }
        // Array of hidden containers
        hidden = await Permission.findAll({ where: { userID: req.session.userID, hide: true}}, { attributes: ['containerID'] });
        // Map the container IDs
        hidden = hidden.map((container) => container.containerID);
        res.send("ok");
    }
}




// Listens for docker events
docker.getEvents({}, function (err, data) {
    data.on('data', function () {
        console.log('Docker event');
    });
}); 