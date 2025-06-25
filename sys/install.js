import { writeFileSync, mkdirSync, unlinkSync, rmSync } from 'fs';
import { Syslog } from './db.js';
import { docker } from './docker.js';
import DockerodeCompose from 'dockerode-compose';
import yaml from 'js-yaml';
import { Alert } from './utils.js';



async function composeInstall (compose, service, req) {

    console.log(`Starting install of ${service}...`);
    Syslog.create({ username: req.session.username, uniqueID: req.session.UUID, event: 'Install', message: `Started install of ${service}`, ip: req.ip });

    console.log('Starting image pull...');
    try {

        await Promise.race([
            compose.pull(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Pull timeout')), 60000))
        ]);

        console.log('Image pull complete');
        Syslog.create({ username: req.session.username, uniqueID: req.session.UUID, event: 'Install', message: `${service}: Image pulled successfully`, ip: req.ip });


        console.log('Starting compose up...');
        await compose.up();

        console.log('Install complete');
        Syslog.create({ username: req.session.username, uniqueID: req.session.UUID, event: 'Install', message: `${service}: Installed successfully`, ip: req.ip });

    } catch {

        console.log('Error. Retrying compose up...');   

        try {
            await compose.up();
            console.log('Install complete.');
            Syslog.create({ username: req.session.username, uniqueID: req.session.UUID, event: 'Install', message: `${service}: Installed successfully`, ip: req.ip });
            // let alert = Alert('success', `Installed ${service} successfully.`);
            // res.send(alert);

        } catch {
            console.log('Install failed');
            Syslog.create({ username: req.session.username, uniqueID: req.session.UUID, event: 'Install', message: `${service}: Install failed`, ip: req.ip });
            // let alert = Alert('danger', `Failed to install ${service}.`);
            // res.send(alert);
        }
    }
}

// async function composeInstall (compose, service, req) {
//     try {
//         console.log('Starting image pull...');
//         await Promise.race([
//             compose.pull(),
//             new Promise((_, reject) => 
//                 setTimeout(() => reject(new Error('Pull timeout')), 60000)
//             )
//         ]);
//         console.log('Image pull complete');

//         console.log('Starting compose up...');
//         await compose.up();
//         console.log('Compose up complete');
//     } catch (err) {
//         console.error('Error in composeInstall');
//         if (err.message === 'Pull timeout') {
//             console.log('Pull timed out, attempting compose up anyway...');
//         } else {
//             console.log('Trying again...');
//         }
        
//         try {
//             await compose.up();
//             console.log('Compose up complete');
//         } catch (upErr) {
//             console.error('Final compose up attempt failed');
//             throw upErr;
//         }
//     }
// }





export const Install = async (req, res) => {

    let { name, service, image, command_check, command, net_mode, restart_policy, host, privileged } = req.body;
    
    // // Example compose file
    // services:
    //  caddy:
    //   container_name: caddy
    //   image: caddy:latest
    //   network_mode: host
    //   restart: unless-stopped
    //   volumes:
    //     - caddy:/data:rw
    //     - caddy:/config:rw
    //     - caddyfiles:/etc/caddy:rw
  
    // volumes:
    //     caddy:
    //     caddyfiles:

    let file = ``;
    file = `services:\n`
    file += `  ${service}:\n`
    file += `    container_name: ${name}\n`;
    file += `    image: ${image}\n`;

    // Command
    if (command_check == 'on') { file += `    command: ${command}\n` }

    // Network mode
    if (net_mode == 'host') { file += `    network_mode: host\n` } 
    else if (net_mode != 'host' && net_mode != 'docker') { file += `    network_mode: '${net_mode}'\n` }

    // Restart policy
    if (restart_policy != '') { file += `    restart: ${restart_policy}\n` }

    // // Privileged mode 
    // if (privileged == 'on') { file += `    privileged: true\n` }

    // Grab all Object.keys that start with 'port'.
    let ports = Object.keys(req.body).filter(key => key.startsWith('port'));
    // Add ports to compose file, unless the network mode is 'host'.
    if ((ports.length > 0) && (net_mode != 'host')) {
        file += `    ports:\n`

        for (let i = 0; i < ports.length; i++) {
            let entry = ports[i];
            entry = entry.replace('port', '');
            let external = req.body[`external${entry}`];
            let internal = req.body[`internal${entry}`];
            let protocol = req.body[`protocol${entry}`];
            // Skip if one of the fields is empty
            if ((external == '' || internal == '')) { continue; }
            file += `      - ${external}:${internal}/${protocol}\n`
        }
    }

    let docker_volumes = [];

    // Grab all Object.keys that start with 'volume'.
    let volumes = Object.keys(req.body).filter(key => key.startsWith('volume'));
    if (volumes.length > 0) {
        file += `    volumes:\n`

        for (let i = 0; i < volumes.length; i++) {
            let entry = volumes[i].replace('volume', '');
            let bind = req.body[`bind${entry}`];
            let container = req.body[`container${entry}`];
            let readwrite = ':' + req.body[`readwrite${entry}`];
            if (readwrite == ':rw') { readwrite = ''; }
            // if it doesn't start with a /, and isn't already found in docker_volume, add it to the list
            if (!bind.startsWith('/') && !docker_volumes.includes(bind)) { docker_volumes.push(bind); }
            // Skip if one of the fields is empty
            if ((bind == '' || container == '')) { continue; }
            file += `      - ${bind}:${container}${readwrite}\n`
        }
    }


    let envs = Object.keys(req.body).filter(key => key.startsWith('env'));
    envs = envs.filter(env => !env.includes('_'));
    if (envs.length > 0) {
        file += `    environment:\n`
        for (let i = 0; i < envs.length; i++) {
            let entry = envs[i].replace('env', '');
            let name = req.body[`env_name${entry}`];
            let default_value = req.body[`env_default${entry}`];
            // Skip if one of the fields is empty
            if ((name == '' || default_value == '')) { continue; }
            file += `      - ${name}=${default_value}\n`
        }
    }

    let labels = Object.keys(req.body).filter(key => key.startsWith('label'));
    labels = labels.filter(label => !label.includes('_'));
    if (labels.length > 0) {
        file += `    labels:\n`
        for (let i = 0; i < labels.length; i++) {
            let entry = labels[i].replace('label', '');
            let name = req.body[`label_name${entry}`];
            let value = req.body[`label_value${entry}`];
            // Skip if one of the fields is empty
            if ((name == '' || value == '')) { continue; }
            file += `      - ${name}=${value}\n`
        }
    }

    // // Hardware acceleration
    // for (let i = 0; i < env_vars.length; i++) {
    //     if ((env_vars[i] == 'on') && (data[`env_${i}_name`] == 'DRINODE')) {
    //         compose_file += `\n    deploy:`
    //         compose_file += `\n      resources:`
    //         compose_file += `\n        reservations:`
    //         compose_file += `\n          devices:`
    //         compose_file += `\n          - driver: nvidia`
    //         compose_file += `\n            count: 1`
    //         compose_file += `\n            capabilities: [gpu]`
    //         break;
    //     }
    // }


    // Add docker volumes to the compose file
    if (docker_volumes.length > 0) {
        file += `\nvolumes:\n`
        for (let i = 0; i < docker_volumes.length; i++) {
            file += `    ${docker_volumes[i]}:\n`
        }
    }
    mkdirSync(`./data/tmp/${name}`, { recursive: true });

    writeFileSync(`./data/tmp/${name}/compose.yaml`, file, function (err) { console.log(err) });


    // // Make sure there isn't a container already running that has the same name
    // let containers = await docker.listContainers({ all: true });
    // for (let i = 0; i < containers.length; i++) {
    //     if (containers[i].Names[0].includes(name)) {
    //         console.log(`App '${name}' already exists. Please choose a different name.`);
    //         let alert = Alert('danger', `App '${name}' already exists. Please choose a different name.`);
    //         res.send(alert);
    //         return;
    //     }
    // }


    // // Compose file installation
    // if (req.body.compose) {
    //     // Create the directory
    //     mkdirSync(`./appdata/${name}`, { recursive: true });
    //     // Write the form data to the compose file
    //     writeFileSync(`./appdata/${name}/compose.yaml`, req.body.compose, function (err) { console.log(err) });
    //     var compose = new DockerodeCompose(docker, `./appdata/${name}/compose.yaml`, `${name}`);
    //     composeInstall(compose);
    //     res.redirect('/');
    //     return;
    // }


    var compose = new DockerodeCompose(docker, `./data/tmp/${name}/compose.yaml`, `${name}`);

    composeInstall(compose, service, req).then(() => {
        // Remove the compose file
        unlinkSync(`./data/tmp/${name}/compose.yaml`);
        // Remove the directory
        rmSync(`./data/tmp/${name}`, { recursive: true });
    });

    let alert = Alert('success', `Installing ${name}. It should appear on the dashboard shortly.`);

    res.send(alert);
}