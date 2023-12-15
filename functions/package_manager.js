const { writeFileSync, mkdirSync, readFileSync } = require("fs");
const yaml = require('js-yaml');

const { execSync } = require("child_process");

const { docker } = require('./system');

var DockerodeCompose = require('dockerode-compose');


module.exports.install = async function (data) {
    
        console.log(`[Start of install function]`);

        let { service_name, name, image, command_check, command, net_mode, restart_policy } = data;        
        let { port0, port1, port2, port3, port4, port5 } = data;
        let { volume0, volume1, volume2, volume3, volume4, volume5 } = data;
        let { env0, env1, env2, env3, env4, env5, env6, env7, env8, env9, env10, env11 } = data;
        let { label0, label1, label2, label3, label4, label5, label6, label7, label8, label9, label10, label11 } = data;

        let docker_volumes = [];

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
            if ((port0 == 'on' || port1 == 'on' || port2 == 'on' || port3 == 'on' || port4 == 'on' || port5 == 'on') && (net_mode != 'host')) {
                compose_file += `\n    ports:`

                    for (let i = 0; i < 6; i++) {
                        if (data[`port${i}`] == 'on') {
                            compose_file += `\n      - ${data[`port_${i}_external`]}:${data[`port_${i}_internal`]}/${data[`port_${i}_protocol`]}`
                        }
                    }
            }

            // Volumes
            if (volume0 == 'on' || volume1 == 'on' || volume2 == 'on' || volume3 == 'on' || volume4 == 'on' || volume5 == 'on') {
                compose_file += `\n    volumes:`

                for (let i = 0; i < 6; i++) {

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
            }

            // Environment variables
            if (env0 == 'on' || env1 == 'on' || env2 == 'on' || env3 == 'on' || env4 == 'on' || env5 == 'on' || env6 == 'on' || env7 == 'on' || env8 == 'on' || env9 == 'on' || env10 == 'on' || env11 == 'on') {
                compose_file += `\n    environment:`
            }
            for (let i = 0; i < 12; i++) {
                if (data[`env${i}`] == 'on') {
                    compose_file += `\n      - ${data[`env_${i}_name`]}=${data[`env_${i}_default`]}`

                }
            }

            // Add labels
            if (label0 == 'on' || label1 == 'on' || label2 == 'on' || label3 == 'on' || label4 == 'on' || label5 == 'on' || label6 == 'on' || label7 == 'on' || label8 == 'on' || label9 == 'on' || label10 == 'on' || label11 == 'on') {
                compose_file += `\n    labels:`
            }   
            for (let i = 0; i < 12; i++) {
                if (data[`label${i}`] == 'on') {
                    compose_file += `\n      - ${data[`label_${i}_name`]}=${data[`label_${i}_value`]}`
                }
            }

            // Add privileged mode 

            if (data.privileged == 'on') {
                compose_file += `\n    privileged: true`
            }


            // Add hardware acceleration to the docker-compose file if one of the environment variables has the label DRINODE
            if (env0 == 'on' || env1 == 'on' || env2 == 'on' || env3 == 'on' || env4 == 'on' || env5 == 'on' || env6 == 'on' || env7 == 'on' || env8 == 'on' || env9 == 'on' || env10 == 'on' || env11 == 'on') {
                for (let i = 0; i < 12; i++) {
                    if (data[`env${i}`] == 'on') {
                        if (data[`env_${i}_name`] == 'DRINODE') {
                            compose_file += `\n    deploy:`
                            compose_file += `\n      resources:`
                            compose_file += `\n        reservations:`
                            compose_file += `\n          devices:`
                            compose_file += `\n          - driver: nvidia`
                            compose_file += `\n            count: 1`
                            compose_file += `\n            capabilities: [gpu]`
                        }
                    }
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

            } catch { console.log('error creating directory or compose file') }

            try {
                var compose = new DockerodeCompose(docker, `./appdata/${name}/docker-compose.yml`, `${name}`);

                (async () => {
                await compose.pull();
                await compose.up();
                })();

            } catch { console.log('error running compose file')}

        }


}



module.exports.uninstall = async function (data) {
    if (data.confirm == 'Yes') {
        console.log(`Uninstalling ${data.service_name}: ${data}`);
        var containerName = docker.getContainer(`${data.service_name}`);
        try {
            await containerName.stop();
            console.log(`Stopped ${data.service_name} container`);
        } catch {
            console.log(`Error stopping ${data.service_name} container`);
        }
        try {
            await containerName.remove();
            console.log(`Removed ${data.service_name} container`);
        } catch {
            console.log(`Error removing ${data.service_name} container`);
        }
    }
}