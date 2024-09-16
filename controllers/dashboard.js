import { currentLoad, mem, networkStats, fsSize } from 'systeminformation';
import { docker, containerInfo, containerLogs, containerStats, GetContainerLists } from '../utils/docker.js';
import { readFileSync } from 'fs';
import { User, Permission, ServerSettings, ContainerLists, Container } from '../database/config.js';
import { Alert, Navbar, Footer, Capitalize } from '../utils/system.js';
import { Op } from 'sequelize';

let [ hidden, alert, stats ] = [ '', '', '', {} ];
let container_link = 'http://localhost';



// Dashboard
export const Dashboard = async function (req, res) {

    let host = req.params.host;
    req.session.host = host;


    // if (host != 1) {
    //     let test = await GetContainerLists(host);
    //     console.log(test);
    // }

    // Create the lists needed for the dashboard
    const [list, created] = await ContainerLists.findOrCreate({
        where: { userID: req.session.userID },
        defaults: {
            userID: req.session.userID,
            username: req.session.username,
            containers: '[]',
            new: '[]',
            updates: '[]',
            sent: '[]',
        },
    });
    if (created) { console.log(`New entry created in ContainerLists for ${req.session.username}`); }


    res.render("dashboard",{ 
        alert: '',
        username: req.session.username,
        role: req.session.role,
        navbar: await Navbar(req),
        footer: await Footer(req),
    }); 
}




// Dashboard search
export const searchDashboard = async function (req, res) {
    console.log(`[Search] ${req.body.search}`);
    res.send('ok');
    return;
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


async function userCards (req) {
    
    let container_list = [];
    // Check what containers the user has hidden.
    let hidden = await Permission.findAll({ where: {userID: req.session.userID, hide: true}}, { attributes: ['containerID'] });
    hidden = hidden.map((container) => container.containerID);

    // Check what containers the user has permission for.
    let visable = await Permission.findAll({ where: { userID: req.session.userID, [Op.or]: [{ uninstall: true }, { edit: true }, { upgrade: true }, { start: true }, { stop: true }, { pause: true }, { restart: true }, { logs: true }, { view: true }] }, attributes: ['containerID'] });
    visable = visable.map((container) => container.containerID);

    let containers = await GetContainerLists(req.session.host);

    for (let i = 0; i < containers.length; i++) {
        let container_name = containers[i].Names[0].split('/').pop();
        // Skip if the ID is found in the hidden list.
        if (hidden.includes(containers[i].Id)) { continue; }
        // Skip if the state is 'created'. 
        if (containers[i].State == 'created') { continue; }
        // Admin can see all containers that they don't have hidden.
        if (req.session.role == 'admin') { container_list.push({ containerName: container_name, containerID: containers[i].Id, containerState: containers[i].State }); }
        // User can see any containers that they have any permissions for.
        else if (visable.includes(containers[i].Id)){ container_list.push({ containerName: container_name, containerID: containers[i].Id, containerState: containers[i].State }); }
    }
    return container_list;
}

// Container actions (start, stop, pause, restart, hide)
export const ContainerAction = async (req, res) => {

    let container_name = req.header('hx-trigger-name');
    let containerID = req.params.containerid;
    let action = req.params.action;
    
    console.log(`[Action] ${action} ${container_name} ${containerID}`);

    if (action == 'reset') { 
        console.log('Resetting view'); 
        await Permission.update({ hide: false }, { where: { userID: req.session.userID } });
        res.redirect('/dashboard');
        return;
    }
    else if (action == 'logs') {
        let logs = await containerLogs(containerID);
        let modal = readFileSync('./views/partials/logs.html', 'utf8');
        modal = modal.replace(/AppName/g, container_name);
        modal = modal.replace(/ContainerID/g, containerID);
        modal = modal.replace(/ContainerLogs/g, logs);

        res.send(modal);
        return;
    }
    else if (action == 'details') {
        let container = await containerInfo(containerID);
        let modal = readFileSync('./views/partials/details.html', 'utf8');
        modal = modal.replace(/AppName/g, container.containerName);
        modal = modal.replace(/AppImage/g, container.containerImage);
        res.send(modal);
        return;
    }
    else if (action == 'uninstall') {
        let modal = readFileSync('./views/partials/uninstall.html', 'utf8');
        modal = modal.replace(/AppName/g, container_name);
        modal = modal.replace(/ContainerID/g, containerID);
        res.send(modal);
        return;
    }
    else if (action == 'link_modal') {
        const [container, created] = await Container.findOrCreate({ where: { containerID: containerID }, defaults: { containerName: container_name, containerID: containerID, link: '' } });
        let modal = readFileSync('./views/partials/link.html', 'utf8');
        modal = modal.replace(/AppName/g, container_name);
        modal = modal.replace(/ContainerID/g, containerID);
        modal = modal.replace(/AppLink/g, container.link);
        res.send(modal);
        return;
    } else if (action == 'update_link') {
        let url = req.body.url;
        console.log(url);
        // find the container entry with the containerID and userID
        let container = await Container.findOne({ where: { containerID: containerID } });
        container.update({ link: url });
        res.send('ok');
        return;
    }

    // Inspect the container
    let info = docker.getContainer(containerID);
    let container = await info.inspect();
    let containerState = container.State.Status;
    
    // Displays container state (starting, stopping, restarting, pausing)
    function status (state) {
        return(`<div class="text-yellow d-inline-flex align-items-center lh-1 ms-auto" id="AltIDState">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon-tabler icon-tabler-point-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"> <path stroke="none" d="M0 0h24v24H0z" fill="none"></path> <path d="M12 7a5 5 0 1 1 -4.995 5.217l-.005 -.217l.005 -.217a5 5 0 0 1 4.995 -4.783z" stroke-width="0" fill="currentColor"></path></svg>
                <strong>${state}</strong>
                </div>`);
    }

    // Perform the action
    if ((action == 'start') && (containerState == 'exited')) {
        info.start();
        res.send(status('starting'));
    } else if ((action == 'start') && (containerState == 'paused')) {
        info.unpause();
        res.send(status('starting'));
    } else if ((action == 'stop') && (containerState != 'exited')) {
        info.stop();
        res.send(status('stopping'));
    } else if ((action == 'pause') && (containerState == 'paused')) {
        info.unpause();
        res.send(status('starting'));
    } else if ((action == 'pause') && (containerState == 'running')) {
        info.pause();
        res.send(status('pausing'));
    } else if (action == 'restart') {
        info.restart();
        res.send(status('restarting'));
    } else if (action == 'hide') {
        let exists = await Permission.findOne({ where: { containerID: containerID, userID: req.session.userID }});
        if (!exists) { const newPermission = await Permission.create({ containerName: container_name, containerID: containerID, username: req.session.username, userID: req.session.userID, hide: true }); }
        else { exists.update({ hide: true }); }
        res.send('ok'); 
    }
}




async function createCard (details) {

    // let trigger = 'data-hx-trigger="load, every 3s"';

    let containerName = details.containerName;
    if (containerName.length > 13) { containerName = containerName.substring(0, 13) + '...'; }
    let containerTitle = Capitalize(containerName);

    let container_link = '';
    let container = await Container.findOne({ where: { containerID: details.containerID } });
    container_link = container.link || '#';

    let titleLink = `<a href="${container_link}" class="nav-link" target="_blank">${containerTitle}</a>`;

    let containerID = details.containerID;
    let containerState = details.containerState;
    let containerService = details.containerService;
    let containerStateColor = '';

    if (containerState == 'running') { containerStateColor = 'green'; }
    else if (containerState == 'exited') { containerStateColor = 'red'; containerState = 'stopped'; }
    else if (containerState == 'paused') { containerStateColor = 'orange'; }
    else { containerStateColor = 'blue'; }

    let container_card = readFileSync('./views/partials/container_card.html', 'utf8');

    container_card = container_card.replace(/ContainerID/g, containerID);
    container_card = container_card.replace(/AltID/g, 'a' + containerID);
    container_card = container_card.replace(/TitleLink/g, titleLink);
    container_card = container_card.replace(/AppName/g, containerName);
    container_card = container_card.replace(/AppTitle/g, containerTitle);
    container_card = container_card.replace(/AppService/g, containerService);
    container_card = container_card.replace(/AppState/g, containerState);
    container_card = container_card.replace(/StateColor/g, containerStateColor);


    let update_status = `<div class="text-yellow">
                            <svg xmlns="http://www.w3.org/2000/svg" class="icon-tabler icon-tabler-point-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"> <path stroke="none" d="M0 0h24v24H0z" fill="none"></path> <path d="M12 7a5 5 0 1 1 -4.995 5.217l-.005 -.217l.005 -.217a5 5 0 0 1 4.995 -4.783z" stroke-width="0" fill="currentColor"></path></svg>
                        </div>`;
    

    if (details.external_port == 0 && details.internal_port == 0) {
        container_card = container_card.replace(/AppPorts/g, ``);
    } else {
        container_card = container_card.replace(/AppPorts/g, `<a href="${container_link}:${details.external_port}" target="_blank" style="color: inherit; text-decoration: none;"> ${details.external_port}:${details.internal_port}</a>`);
    }
    return container_card;
}



export const UpdateCard = async function (req, res) {

        let containerID = req.params.containerid;

        let lists = await ContainerLists.findOne({ where: { userID: req.session.userID }, attributes: ['containers'] });
        let container_list = JSON.parse(lists.containers);

        let found = container_list.find(c => c.containerID === containerID);
        if (!found) { res.send(''); return; }
        let details = await containerInfo(containerID);
        let card = await createCard(details);
        res.send(card);
}



export const CardList = async function (req, res) {
    let cards_list = '';
    // Check if there are any new cards in queue.
    let new_cards = await ContainerLists.findOne({ where: { userID: req.session.userID }, attributes: ['new'] });
    let new_list = JSON.parse(new_cards.new);
    // Check what containers the user should see.
    let containers = await userCards(req);
    // Create the cards.
    if (new_list.length > 0) {
        for (let i = 0; i < new_list.length; i++) {
            let details = await containerInfo(new_list[i]);
            let card = await createCard(details);
            cards_list += card;
        }
    } else {
        for (let i = 0; i < containers.length; i++) {
            let details = await containerInfo(containers[i].containerID);
            let card = await createCard(details);
            cards_list += card;
        }
    }
    // Update lists, clear the queue, and send the cards.
    await ContainerLists.update({ containers: JSON.stringify(containers), sent: JSON.stringify(containers), new: '[]' }, { where: { userID: req.session.userID } });
    res.send(cards_list);
}


// HTMX - Server-side events
export const SSE = async (req, res) => {
    
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive' 
    });
    
    async function eventCheck () {


        let list = await ContainerLists.findOne({ where: { userID: req.session.userID }, attributes: ['sent'] });
        let container_list = await userCards(req);

        let new_cards = [];
        let update_list = [];
        let sent_cards = [];
        sent_cards = JSON.parse(list.sent);

        if (JSON.stringify(container_list) == list.sent) { return; }
        console.log(`Update for ${req.session.username}`);

        // loop through the containers list to see if any new containers have been added or changed
        container_list.forEach(container => {
            let { containerName, containerID, containerState } = container;
            if (list.sent) { sent_cards = JSON.parse(list.sent); }
            
            let found = sent_cards.find(c => c.containerID === containerID);
            if (!found) { new_cards.push(containerID); }
            else if (found.containerState !== containerState) { update_list.push(containerID); }
        });

        // loop through the sent list to see if any containers have been removed
        sent_cards.forEach(container => {
            let { containerName, containerID, containerState } = container;
            let found = container_list.find(c => c.containerID === containerID);
            if (!found) { update_list.push(containerID); }
        });

        await ContainerLists.update({ new: JSON.stringify(new_cards), sent: JSON.stringify(container_list), containers: JSON.stringify(container_list) }, { where: { userID: req.session.userID } });
        
        if (update_list.length > 0 ) {
            for (let i = 0; i < update_list.length; i++) {
                res.write(`event: ${update_list[i]}\n`);
                res.write(`data: 'update cards'\n\n`);
            }    
        }

        if (new_cards.length > 0) {
            res.write(`event: update\n`);
            res.write(`data: 'card updates'\n\n`);
        }

    }
    
    docker.getEvents({}, async function (err, data) {
        data.on('data', async function () {
            console.log(`[Docker Event]`);
            await eventCheck();
        });
    });

    req.on('close', async () => {
        // Nothing
    });
}