const { writeFileSync, mkdirSync, readFileSync } = require("fs");
const { exec, execSync } = require("child_process");
const { dashCard } = require('../components/dashCard');
const yaml = require('js-yaml');



exports.Install = async function (req, res) {
    
    if (req.session.role == "admin") {


        let { service_name, name, image, command_check, command, net_mode, restart_policy } = req.body;

        let { port0, port1, port2, port3, port4, port5 } = req.body;
        let { volume0, volume1, volume2, volume3, volume4, volume5 } = req.body;
        let { env0, env1, env2, env3, env4, env5, env6, env7, env8, env9, env10, env11 } = req.body;
        let { label0, label1, label2, label3, label4, label5, label6, label7, label8, label9, label10, label11 } = req.body;


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

            let container_info = {
                name: name,
                service: service_name,
                state: 'installing',
                image: image,
                restart_policy: restart_policy
            }
            

            let installCard = dashCard(container_info);

            req.app.locals.install = installCard;

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
                        if (req.body[`port${i}`] == 'on') {
                            compose_file += `\n      - ${req.body[`port_${i}_external`]}:${req.body[`port_${i}_internal`]}/${req.body[`port_${i}_protocol`]}`
                        }
                    }
            }

            // Volumes
            if (volume0 == 'on' || volume1 == 'on' || volume2 == 'on' || volume3 == 'on' || volume4 == 'on' || volume5 == 'on') {
                compose_file += `\n    volumes:`

                for (let i = 0; i < 6; i++) {
                    if (req.body[`volume${i}`] == 'on') {
                        compose_file += `\n      - ${req.body[`volume_${i}_bind`]}:${req.body[`volume_${i}_container`]}:${req.body[`volume_${i}_readwrite`]}`
                    }
                }
            }

            // Environment variables
            if (env0 == 'on' || env1 == 'on' || env2 == 'on' || env3 == 'on' || env4 == 'on' || env5 == 'on' || env6 == 'on' || env7 == 'on' || env8 == 'on' || env9 == 'on' || env10 == 'on' || env11 == 'on') {
                compose_file += `\n    environment:`
            }
            for (let i = 0; i < 12; i++) {
                if (req.body[`env${i}`] == 'on') {
                    compose_file += `\n      - ${req.body[`env_${i}_name`]}=${req.body[`env_${i}_default`]}`

                }
            }

            // Add labels
            if (label0 == 'on' || label1 == 'on' || label2 == 'on' || label3 == 'on' || label4 == 'on' || label5 == 'on' || label6 == 'on' || label7 == 'on' || label8 == 'on' || label9 == 'on' || label10 == 'on' || label11 == 'on') {
                compose_file += `\n    labels:`
            }   
            for (let i = 0; i < 12; i++) {
                if (req.body[`label${i}`] == 'on') {
                    compose_file += `\n      - ${req.body[`label_${i}_name`]}=${req.body[`label_${i}_value`]}`
                }
            }

            // Add privileged mode 

            if (req.body.privileged == 'on') {
                compose_file += `\n    privileged: true`
            }


            // Add hardware acceleration to the docker-compose file if one of the environment variables has the label DRINODE
            if (env0 == 'on' || env1 == 'on' || env2 == 'on' || env3 == 'on' || env4 == 'on' || env5 == 'on' || env6 == 'on' || env7 == 'on' || env8 == 'on' || env9 == 'on' || env10 == 'on' || env11 == 'on') {
                for (let i = 0; i < 12; i++) {
                    if (req.body[`env${i}`] == 'on') {
                        if (req.body[`env_${i}_name`] == 'DRINODE') {
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

            try {   
                mkdirSync(`./appdata/${name}`, { recursive: true });
                writeFileSync(`./appdata/${name}/docker-compose.yml`, compose_file, function (err) { console.log(err) });

                exec(`docker compose -f ./appdata/${name}/docker-compose.yml up -d`, (error, stdout, stderr) => {
                    if (error) { console.error(`error: ${error.message}`); return; }
                    if (stderr) { console.error(`stderr: ${stderr}`); return; }
                    console.log(`stdout:\n${stdout}`);
                });
            } catch { console.log('error creating directory or compose file') }

        }

        // Redirect to the home page
        res.redirect("/");
    } else {
        // Redirect to the login page
        res.redirect("/login");
    }
}



exports.Uninstall = async function (req, res) {
    
    if (req.session.role == "admin") {


        if (req.body.confirm == 'Yes') {
            exec(`docker compose -f ./appdata/${req.body.service_name}/docker-compose.yml down`, (error, stdout, stderr) => {
                if (error) { console.error(`error: ${error.message}`); return; }
                if (stderr) { console.error(`stderr: ${stderr}`); return; }
                console.log(`stdout:\n${stdout}`);
            });
        }


        // Redirect to the home page
        res.redirect("/");
    } else {
        // Redirect to the login page
        res.redirect("/login");
    }
}