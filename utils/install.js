import { writeFileSync, mkdirSync, readFileSync, readdirSync, writeFile } from "fs";
import { execSync } from "child_process";
import { Syslog } from "../database/config.js";
import { docker } from "../utils/docker.js";
import DockerodeCompose from "dockerode-compose";
import yaml from 'js-yaml';



export const Install = async (req, res) => {

        let data = req.body;

        let { name, service_name, image, command_check, command, net_mode, restart_policy } = data;        
        let { port0, port1, port2, port3, port4, port5 } = data;
        let { volume0, volume1, volume2, volume3, volume4, volume5 } = data;
        let { env0, env1, env2, env3, env4, env5, env6, env7, env8, env9, env10, env11 } = data;
        let { label0, label1, label2, label3, label4, label5, label6, label7, label8, label9, label10, label11 } = data;

        let ports = [ port0, port1, port2, port3, port4, port5 ];
        let volumes = [volume0, volume1, volume2, volume3, volume4, volume5];
        let env_vars = [env0, env1, env2, env3, env4, env5, env6, env7, env8, env9, env10, env11];
        let labels = [label0, label1, label2, label3, label4, label5, label6, label7, label8, label9, label10, label11];
        
        let docker_volumes = [];

        // Make sure there isn't a container already running that has the same name
        let containers = await docker.listContainers({ all: true });
        for (let i = 0; i < containers.length; i++) {
            if (containers[i].Names[0].includes(name)) {
                // addAlert(req.session, 'danger', `App '${name}' already exists. Please choose a different name.`);
                console.log(`App '${name}' already exists. Please choose a different name.`);
                res.redirect('/');
                return;
            }
        }

        async function composeInstall (name, compose, req) {
            try {
                await compose.pull().then(() => {
                    compose.up();

                    Syslog.create({
                        user: req.session.user,
                        email: null,
                        event: "App Installation",
                        message: `${name} installed successfully`,
                        ip: req.socket.remoteAddress
                    }); 

                });
            } catch (err) {
                await Syslog.create({
                    user: req.session.user,
                    email: null,
                    event: "App Installation",
                    message: `${name} installation failed: ${err}`,
                    ip: req.socket.remoteAddress
                });
            }
        }

        // addAlert(req.session, 'success', `Installing ${name}. It should appear on the dashboard shortly.`);
        console.log(`Installing ${name}. It should appear on the dashboard shortly.`);

        // Compose file installation
        if (req.body.compose) {
            // Create the directory
            mkdirSync(`./appdata/${name}`, { recursive: true });
            // Write the form data to the compose file
            writeFileSync(`./templates/compose/${name}/compose.yaml`, req.body.compose, function (err) { console.log(err) });
            var compose = new DockerodeCompose(docker, `./templates/compose/${name}/compose.yaml`, `${name}`);
            composeInstall(name, compose, req);
            res.redirect('/');
            return;
        }

        // Convert a JSON template into a compose file
        let compose_file = `version: '3'`;
            compose_file += `\nservices:`
            compose_file += `\n  ${service_name}:`
            compose_file += `\n    container_name: ${name}`;
            compose_file += `\n    image: ${image}`;

        // Command
        if (command_check == 'on') { compose_file += `\n    command: ${command}` }

        // Network mode
        if (net_mode == 'host') { compose_file += `\n    network_mode: 'host'` } 
        else if (net_mode != 'host' && net_mode != 'docker') { compose_file += `\n    network_mode: '${net_mode}'` }
        
        // Restart policy
        if (restart_policy != '') { compose_file += `\n    restart: ${restart_policy}` }

        // Ports
        for (let i = 0; i < ports.length; i++) {
            if ((ports[i] == 'on') && (net_mode != 'host')) {
                compose_file += `\n    ports:`
                break;
            }
        }

        for (let i = 0; i < ports.length; i++) {
            if ((ports[i] == 'on') && (net_mode != 'host')) {
                compose_file += `\n      - ${data[`port_${i}_external`]}:${data[`port_${i}_internal`]}/${data[`port_${i}_protocol`]}`
            }
        }

        // Volumes
        for (let i = 0; i < volumes.length; i++) {
            if (volumes[i] == 'on') {
                compose_file += `\n    volumes:`
                break;
            }
        }

        for (let i = 0; i < volumes.length; i++) {
            // if volume is on and neither bind or container is empty, it's a bind mount (ex /mnt/user/appdata/config:/config  )
            if ((data[`volume${i}`] == 'on') && (data[`volume_${i}_bind`] != '') && (data[`volume_${i}_container`] != '')) {
                compose_file += `\n      - ${data[`volume_${i}_bind`]}:${data[`volume_${i}_container`]}:${data[`volume_${i}_readwrite`]}`
            }
            // if bind is empty create a docker volume (ex container_name_config:/config) convert any '/' in container name to '_'
            else if ((data[`volume${i}`] == 'on') && (data[`volume_${i}_bind`] == '') && (data[`volume_${i}_container`] != '')) {
                let volume_name = data[`volume_${i}_container`].replace(/\//g, '_');
                compose_file += `\n      - ${name}_${volume_name}:${data[`volume_${i}_container`]}:${data[`volume_${i}_readwrite`]}`
                docker_volumes.push(`${name}_${volume_name}`);
            } 
        }

        // Environment variables
        for (let i = 0; i < env_vars.length; i++) {
            if (env_vars[i] == 'on') {
                compose_file += `\n    environment:`
                break;
            }
        }
        for (let i = 0; i < env_vars.length; i++) {
            if (env_vars[i] == 'on') {
                compose_file += `\n      - ${data[`env_${i}_name`]}=${data[`env_${i}_default`]}`
            }
        }

        // Labels
        for (let i = 0; i < labels.length; i++) {
            if (labels[i] == 'on') {
                compose_file += `\n    labels:`
                break;
            }
        }

        for (let i = 0; i < 12; i++) {
            if (data[`label${i}`] == 'on') {
                compose_file += `\n      - ${data[`label_${i}_name`]}=${data[`label_${i}_value`]}`
            }
        }

        // Privileged mode 
        if (data.privileged == 'on') { compose_file += `\n    privileged: true` }

        // Hardware acceleration
        for (let i = 0; i < env_vars.length; i++) {
            if ((env_vars[i] == 'on') && (data[`env_${i}_name`] == 'DRINODE')) {
                compose_file += `\n    deploy:`
                compose_file += `\n      resources:`
                compose_file += `\n        reservations:`
                compose_file += `\n          devices:`
                compose_file += `\n          - driver: nvidia`
                compose_file += `\n            count: 1`
                compose_file += `\n            capabilities: [gpu]`
                break;
            }
        }

        // add volumes to the compose file
        if ( docker_volumes.length > 0 ) {
            compose_file += `\n`
            compose_file += `\nvolumes:`
            // Removed any duplicates from docker_volumes
            docker_volumes = docker_volumes.filter((item, index) => docker_volumes.indexOf(item) === index)
            for (let i = 0; i < docker_volumes.length; i++) {
                if ( docker_volumes[i] != '') {
                    compose_file += `\n  ${docker_volumes[i]}:`
                }
            }
        }
        
        mkdirSync(`./appdata/${name}`, { recursive: true });
        writeFileSync(`./appdata/${name}/compose.yaml`, compose_file, function (err) { console.log(err) });
        var compose = new DockerodeCompose(docker, `./appdata/${name}/compose.yaml`, `${name}`);
        composeInstall(name, compose, req);
    
        
    res.redirect('/');
}

// im just going to leave this old stackfile snippet here for now

// if (image.startsWith('https://')){
//     mkdirSync(`./appdata/${name}`, { recursive: true });
//     execSync(`curl -o ./appdata/${name}/${name}_stack.yml -L ${image}`);
//     console.log(`Downloaded stackfile: ${image}`);
//     let stackfile = yaml.load(readFileSync(`./appdata/${name}/${name}_stack.yml`, 'utf8'));
//     let services = Object.keys(stackfile.services);

//     for ( let i = 0; i < services.length; i++ ) {
//         try {
//             console.log(stackfile.services[Object.keys(stackfile.services)[i]].environment);
//         } catch { console.log('no env') }
//     }
// }