import { currentLoad, mem, networkStats, fsSize } from 'systeminformation';
import { containerList, containerInspect } from '../utils/docker.js';
import { readFileSync } from 'fs';
import { User } from '../database/config.js';
import { Alert, getLanguage, Navbar } from '../utils/system.js';

export const Dashboard = async function(req,res){

    let container_list = '';

    let containers = await containerList();
    for (let container of containers) {
        let details = await containerInspect(container.containerID);
        let container_card = readFileSync('./views/partials/container_card.html', 'utf8');

        if (details.name.length > 17) {
            details.name = details.name.substring(0, 17) + '...';
        }

        // Capitalize the first letter of the name
        details.name = details.name.charAt(0).toUpperCase() + details.name.slice(1);


        let state = details.state;
        let state_color = '';

        switch (state) {
            case 'running':
                state_color = 'green';
                break;
            case 'exited':
                state = 'stopped';
                state_color = 'red';
                break;
            case 'paused':
                state_color = 'orange';
                break;
            case 'installing':
                state_color = 'blue';
                break;
        }

        container_card = container_card.replace(/AppName/g, details.name);
        container_card = container_card.replace(/AppService/g, details.service);
        container_card = container_card.replace(/AppState/g, state);
        container_card = container_card.replace(/StateColor/g, state_color);

        if (details.external_port == 0 && details.internal_port == 0) {
            container_card = container_card.replace(/AppPorts/g, ``);
        } else {
            container_card = container_card.replace(/AppPorts/g, `${details.external_port}:${details.internal_port}`);
        }


        container_list += container_card;
    }


    res.render("dashboard",{ 
        alert: '',
        username: req.session.username,
        role: req.session.role,
        container_list: container_list,
        navbar: await Navbar(req),
    }); 
}



// Server metrics (CPU, RAM, TX, RX, DISK)
export const ServerMetrics = async (req, res) => {
    let name = req.header('hx-trigger-name');
    let color = req.header('hx-trigger');
    let value = 0;
    switch (name) {
        case 'CPU': 
            await currentLoad().then(data => { value = Math.round(data.currentLoad); });
            break;
        case 'RAM': 
            await mem().then(data => { value = Math.round((data.active / data.total) * 100); });
            break;
        case 'NET':
            let [down, up, percent] = [0, 0, 0];
            await networkStats().then(data => { down = Math.round(data[0].rx_bytes / (1024 * 1024)); up = Math.round(data[0].tx_bytes / (1024 * 1024)); percent = Math.round((down / 1000) * 100); });
            let net = `<div class="font-weight-medium"><label class="cpu-text mb-1">Down:${down}MB  Up:${up}MB</label></div>
                        <div class="cpu-bar meter animate ${color}"><span style="width:20%"><span></span></span></div>`;           
            res.send(net);
            return;
        case 'DISK':
            await fsSize().then(data => { value = data[0].use; });
            break;
    }
    let info = `<div class="font-weight-medium"> <label class="cpu-text mb-1">${name} ${value}%</label></div>
                <div class="cpu-bar meter animate ${color}"><span style="width:${value}%"><span></span></span></div>`;
    res.send(info);
}


export const submitDashboard = async function(req,res){
    console.log(req.body);
    res.send('ok');
    return;
}