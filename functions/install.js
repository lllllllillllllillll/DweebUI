import { writeFileSync, mkdirSync, readFileSync } from "fs";
import yaml from 'js-yaml';
import { execSync } from "child_process";
import { docker } from "../server.js";
import DockerodeCompose from "dockerode-compose";
import { Syslog } from "../database/models.js";
import { addCard } from "../controllers/dashboard.js";

// This entire page hurts to look at. 
export const Install = async (req, res) => {

        let data = req.body;

        let { service_name, name, image, command_check, command, net_mode, restart_policy } = data;        
        let { port0, port1, port2, port3, port4, port5 } = data;
        let { volume0, volume1, volume2, volume3, volume4, volume5 } = data;
        let { env0, env1, env2, env3, env4, env5, env6, env7, env8, env9, env10, env11 } = data;
        let { label0, label1, label2, label3, label4, label5, label6, label7, label8, label9, label10, label11 } = data;

        let ports = [port0, port1, port2, port3, port4, port5]

        let docker_volumes = [];

        addCard(name, 'installing');

        if (image.startsWith('https://')){
            mkdirSync(`./appdata/${name}`, { recursive: true });
            execSync(`curl -o ./appdata/${name}/${name}_stack.yml -L ${image}`);
            console.log(`Downloaded stackfile: ${image}`);
            let stackfile = yaml.load(readFileSync(`./appdata/${name}/${name}_stack.yml`, 'utf8'));
            let services = Object.keys(stackfile.services);

            for ( let i = 0; i < services.length; i++ ) {
                try {
                    console.log(stackfile.services[Object.keys(stackfile.services)[i]].environment);
                } catch { console.log('no env') }
            }
        } else {

            let compose_file = `version: '3'`;
                compose_file += `\nservices:`
                compose_file += `\n  ${service_name}:`
                compose_file += `\n    container_name: ${name}`;
                compose_file += `\n    image: ${image}`;

            // Command
            if (command_check == 'on') {
                compose_file += `\n    command: ${command}`
            }

            // Network mode
            if (net_mode == 'host') {
                compose_file += `\n    network_mode: 'host'`
            }
            else if (net_mode != 'host' && net_mode != 'docker') {
                compose_file += `\n    network_mode: '${net_mode}'`
            }
            
            // Restart policy
            if (restart_policy != '') {
                compose_file += `\n    restart: ${restart_policy}`
            }

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
            let volumes = [volume0, volume1, volume2, volume3, volume4, volume5]

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
            let env_vars = [env0, env1, env2, env3, env4, env5, env6, env7, env8, env9, env10, env11]

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
            let labels = [label0, label1, label2, label3, label4, label5, label6, label7, label8, label9, label10, label11]

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
            if (data.privileged == 'on') {
                compose_file += `\n    privileged: true`
            }

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

    
            // add any docker volumes to the docker-compose file
            if ( docker_volumes.length > 0 ) {
                compose_file += `\n`
                compose_file += `\nvolumes:`

                // check docker_volumes for duplicates and remove them completely
                docker_volumes = docker_volumes.filter((item, index) => docker_volumes.indexOf(item) === index)

                for (let i = 0; i < docker_volumes.length; i++) {
                    if ( docker_volumes[i] != '') {
                        compose_file += `\n  ${docker_volumes[i]}:`
                    }
                }
            }

            try {   
                mkdirSync(`./appdata/${name}`, { recursive: true });
                writeFileSync(`./appdata/${name}/docker-compose.yml`, compose_file, function (err) { console.log(err) });
                var compose = new DockerodeCompose(docker, `./appdata/${name}/docker-compose.yml`, `${name}`);

            } catch { 
                const syslog = await Syslog.create({
                    user: req.session.user,
                    email: null,
                    event: "App Installation",
                    message: `${name} installation failed - error creating directory or compose file : ${err}`,
                    ip: req.socket.remoteAddress
                });
            }

            try {
                (async () => {
                    await compose.pull();
                    await compose.up();

                    const syslog = await Syslog.create({
                        user: req.session.user,
                        email: null,
                        event: "App Installation",
                        message: `${name} installed successfully`,
                        ip: req.socket.remoteAddress
                    });  
                })();
            } catch (err) {
                const syslog = await Syslog.create({
                    user: req.session.user,
                    email: null,
                    event: "App Installation",
                    message: `${name} installation failed: ${err}`,
                    ip: req.socket.remoteAddress
                });
            }
        }
    res.redirect('/');
}
