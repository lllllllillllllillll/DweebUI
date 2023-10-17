const { writeFileSync, mkdirSync, appendFileSync } = require("fs");
const { exec } = require("child_process");
const { dashCard } = require('../components/dashCard');



exports.Install = async function (req, res) {
    
    if (req.session.role == "admin") {

        console.log(req.body);
        
        let { service_name, name, image, command_check, command, net_mode, restart_policy } = req.body;

        let { port_0_check, port_1_check, port_2_check, port_3_check, port_4_check, port_5_check } = req.body;
        let { volume_0_check, volume_1_check, volume_2_check, volume_3_check, volume_4_check, volume_5_check } = req.body;
        let { env_0_check, env_1_check, env_2_check, env_3_check, env_4_check, env_5_check, env_6_check, env_7_check, env_8_check, env_9_check, env_10_check, env_11_check } = req.body;
        let { label_0_check, label_1_check, label_2_check, label_3_check, label_4_check, label_5_check, label_6_check, label_7_check, label_8_check, label_9_check, label_10_check, label_11_check } = req.body;


        let installCard = dashCard(req.body.name, req.body.service_name, '', 'installing', req.body.image, 0, 0);
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
        if ((port_0_check == 'on' || port_1_check == 'on' || port_2_check == 'on' || port_3_check == 'on' || port_4_check == 'on' || port_5_check == 'on') && (net_mode != 'host')) {
            compose_file += `\n    ports:`

                for (let i = 0; i < 6; i++) {
                    if (req.body[`port_${i}_check`] == 'on') {
                        compose_file += `\n      - ${req.body[`port_${i}_external`]}:${req.body[`port_${i}_internal`]}/${req.body[`port_${i}_protocol`]}`
                    }
                }
        }

        // Volumes
        if (volume_0_check == 'on' || volume_1_check == 'on' || volume_2_check == 'on' || volume_3_check == 'on' || volume_4_check == 'on' || volume_5_check == 'on') {
            compose_file += `\n    volumes:`

            for (let i = 0; i < 6; i++) {
                if (req.body[`volume_${i}_check`] == 'on') {
                    compose_file += `\n      - ${req.body[`volume_${i}_bind`]}:${req.body[`volume_${i}_container`]}:${req.body[`volume_${i}_readwrite`]}`
                }
            }
        }

        // Environment variables
        if (env_0_check == 'on' || env_1_check == 'on' || env_2_check == 'on' || env_3_check == 'on' || env_4_check == 'on' || env_5_check == 'on' || env_6_check == 'on' || env_7_check == 'on' || env_8_check == 'on' || env_9_check == 'on' || env_10_check == 'on' || env_11_check == 'on') {
            compose_file += `\n    environment:`
        }
        for (let i = 0; i < 12; i++) {
            if (req.body[`env_${i}_check`] == 'on') {
                compose_file += `\n      - ${req.body[`env_${i}_name`]}=${req.body[`env_${i}_default`]}`

            }
        }

        // Add labels
        if (label_0_check == 'on' || label_1_check == 'on' || label_2_check == 'on' || label_3_check == 'on' || label_4_check == 'on' || label_5_check == 'on' || label_6_check == 'on' || label_7_check == 'on' || label_8_check == 'on' || label_9_check == 'on' || label_10_check == 'on' || label_11_check == 'on') {
            compose_file += `\n    labels:`
        }   
        for (let i = 0; i < 12; i++) {
            if (req.body[`label_${i}_check`] == 'on') {
                compose_file += `\n      - ${req.body[`label_${i}_name`]}=${req.body[`label_${i}_value`]}`
            }
        }

        // Add privileged mode 

        if (req.body.privileged == 'on') {
            compose_file += `\n    privileged: true`
        }


        // Add hardware acceleration to the docker-compose file if one of the environment variables has the label DRINODE
        if (env_0_check == 'on' || env_1_check == 'on' || env_2_check == 'on' || env_3_check == 'on' || env_4_check == 'on' || env_5_check == 'on' || env_6_check == 'on' || env_7_check == 'on' || env_8_check == 'on' || env_9_check == 'on' || env_10_check == 'on' || env_11_check == 'on') {
            for (let i = 0; i < 12; i++) {
                if (req.body[`env_${i}_check`] == 'on') {
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