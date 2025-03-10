import { currentLoad, mem, networkStats, fsSize } from 'systeminformation';
import { docker, docker2, docker3, docker4, docker5, docker6, docker7, docker8, containerInfo, containerLogs, GetContainerLists, containerStats, trigger_docker_event } from '../utils/docker.js';
import { readFileSync } from 'fs';
import { User, Permission, ServerSettings, ContainerLists, Container, Hosts } from '../db/config.js';
import { Alert, Navbar, Footer, Capitalize } from '../utils/system.js';
import { Op } from 'sequelize';



export const Dashboard = async function (req, res) {

    // Create the lists needed for the dashboard.
    await ContainerLists.findOrCreate({ where: { userID: req.session.userID }, defaults: { userID: req.session.userID, username: req.session.username, containers: '[]', new: '[]', updates: '[]', sent: '[]', }, });
    // Make sure host is set.
    if (!req.session.host) { req.session.host = 1; }

    // Load the dashboard page which will trigger 'card_list' in DashboardView.
    res.render("dashboard",{ 
        username: req.session.username,
        role: req.session.role,
        navbar: await Navbar(req),
        footer: await Footer(req),
    }); 
}



async function userCards (req) {

    console.log('[userCards]');
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





// HTMX - Server-Side Events
export const SSE = async (req, res) => {
    // Set the headers for the event stream.
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });
    
    async function eventCheck () {

        let [new_cards, update_list, sent_cards] = [[], [], []];

        let list = await ContainerLists.findOne({ where: { userID: req.session.userID }, attributes: ['sent'] });
        sent_cards = JSON.parse(list.sent);

        let container_list = await userCards(req);
        
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
    
    // check which hosts are enabled in the database and create a event stream for each one
    let hosts = await Hosts.findAll();

    if (hosts[0]) {
        if (hosts[0].state == 'enabled' && hosts[0].connected == 'true') {
            console.log('Listening for Host 1 events');
            await docker.getEvents({}, async function (err, data) {
                data.on('data', async function () {
                    console.log('Host 1 event');
                    await eventCheck();
                });
            });
        }
    }

    if (hosts[1]) {
        if (hosts[1].state == 'enabled' && hosts[1].connected == 'true') {
            console.log('Listening for Host 2 events');
            await docker2.getEvents({}, async function (err, data) {
                data.on('data', async function () {
                    console.log('Host 2 event');
                    await eventCheck();
                });
            });
        }
    }

    if (hosts[2]) {
        if (hosts[2].state == 'enabled' && hosts[2].connected == 'true') {
            console.log('Listening for Host 3 events');
            await docker3.getEvents({}, async function (err, data) {
                data.on('data', async function () {
                    console.log('Host 3 event');
                    await eventCheck();
                });
            });
        }
    }

    if (hosts[3]) {
        if (hosts[3].state == 'enabled' && hosts[3].connected == 'true') {
            console.log('Listening for Host 4 events');
            await docker4.getEvents({}, async function (err, data) {
                data.on('data', async function () {
                    console.log('Host 4 event');
                    await eventCheck();
                });
            });
        }
    }

    if (hosts[4]) {
        if (hosts[4].state == 'enabled' && hosts[4].connected == 'true') {
            console.log('Listening for Host 5 events');
            await docker5.getEvents({}, async function (err, data) {
                data.on('data', async function () {
                    console.log('Host 5 event');
                    await eventCheck();
                });
            });
        }
    }

    if (hosts[5]) {
        if (hosts[5].state == 'enabled' && hosts[5].connected == 'true') {
            console.log('Listening for Host 6 events');
            await docker6.getEvents({}, async function (err, data) {
                data.on('data', async function () {
                    console.log('Host 6 event');
                    await eventCheck();
                });
            });
        }
    }

    if (hosts[6]) {
        if (hosts[6].state == 'enabled' && hosts[6].connected == 'true') {
            console.log('Listening for Host 7 events');
            await docker7.getEvents({}, async function (err, data) {
                data.on('data', async function () {
                    console.log('Host 7 event');
                    await eventCheck();
                });
            });
        }
    }

    if (hosts[7]) {
        if (hosts[7].state == 'enabled' && hosts[7].connected == 'true') {
            console.log('Listening for Host 8 events');
            await docker8.getEvents({}, async function (err, data) {
                data.on('data', async function () {
                    console.log('Host 8 event');
                    await eventCheck();
                });
            });
        }
    }

    req.on('close', async () => {
    });
}



export const DashboardView = async function (req, res) {

    let container_name = req.header('hx-trigger-name');
    let view = req.params.view;
    let containerID = req.params.id;
    let AltID = `a${containerID}`;

    // console.log(`[container_name] ${container_name} [view] ${view} [host] ${req.session.host} [containerID] ${containerID}`);

    // Container CPU and RAM chart

    if (view == 'chart') {
        let container = await Container.findOne({ where: { containerID: containerID } });
        // Get the cpu and ram stats, remove the oldest entry, add the newest stats, then update container info.
        let stats = await containerStats(containerID);        
        let cpu = JSON.parse(container.cpu); cpu.shift(); cpu.push(stats.cpu);
        let ram = JSON.parse(container.ram); ram.shift(); ram.push(stats.ram);
        container.update({ cpu: JSON.stringify(cpu), ram: JSON.stringify(ram) });

        let chartData = `<div name="${container_name}" id="${AltID}info" hx-get="/dashboard/view/chart/${containerID}" hx-swap="outerHTML" hx-trigger="every 3s" hx-target="#${AltID}info">
                                <script>
                                    ${AltID}chart.updateSeries([{
                                        name: 'CPU',
                                        data: ${container.cpu}
                                    }, {
                                        name: 'RAM',
                                        data: ${container.ram}
                                    }]);
                                </script>
                            </div>`;
        res.send(chartData);
        return;
    }

    // Permissions modal
    if (view == 'permissions') {
        let title = Capitalize(container_name);
        let users = await User.findAll({ attributes: ['username', 'userID'] });
    
        let modal =`<div class="modal-header">
                                <h5 class="modal-title">${title} Permissions</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body"><div class="accordion" id="accordion-example">`;
    
        for (let i = 0; i < users.length; i++) {
            if (users.length == 1) { modal += 'No other users.'; break; }
            // Skip the admin user.
            else if (i == 0) { continue; }
            let exists = await Permission.findOne({ where: {containerID: containerID, userID: users[i].userID}});
            if (!exists) { await Permission.create({ containerName: container_name, containerID: containerID, userID: users[i].userID, username: users[i].username}); }
            let permissions = await Permission.findOne({ where: {containerID: containerID, userID: users[i].userID}});
            let user_permissions = readFileSync('./views/partials/permissions.html', 'utf8');
            if (permissions.uninstall == true && permissions.edit == true && permissions.upgrade == true && permissions.start == true && permissions.stop == true && permissions.pause == true && permissions.restart == true && permissions.logs == true && permissions.view == true) { user_permissions = user_permissions.replace(/data-AllCheck/g, 'checked'); }
            if (permissions.uninstall == true) { user_permissions = user_permissions.replace(/data-UninstallCheck/g, 'checked'); }
            if (permissions.edit == true) { user_permissions = user_permissions.replace(/data-EditCheck/g, 'checked'); }
            if (permissions.upgrade == true) { user_permissions = user_permissions.replace(/data-UpgradeCheck/g, 'checked'); }
            if (permissions.start == true) { user_permissions = user_permissions.replace(/data-StartCheck/g, 'checked'); }
            if (permissions.stop == true) { user_permissions = user_permissions.replace(/data-StopCheck/g, 'checked'); }
            if (permissions.pause == true) { user_permissions = user_permissions.replace(/data-PauseCheck/g, 'checked'); }
            if (permissions.restart == true) { user_permissions = user_permissions.replace(/data-RestartCheck/g, 'checked'); }
            if (permissions.logs == true) { user_permissions = user_permissions.replace(/data-LogsCheck/g, 'checked'); }
            if (permissions.view == true) { user_permissions = user_permissions.replace(/data-ViewCheck/g, 'checked'); }
            user_permissions = user_permissions.replace(/Entry/g, i);
            user_permissions = user_permissions.replace(/Entry/g, i);
            user_permissions = user_permissions.replace(/Entry/g, i);
            user_permissions = user_permissions.replace(/container_id/g, containerID);
            user_permissions = user_permissions.replace(/container_name/g, container_name);
            user_permissions = user_permissions.replace(/user_id/g, users[i].userID);
            user_permissions = user_permissions.replace(/Username/g, users[i].username);
            modal += user_permissions;
        }
        modal += `</div></div>
                        <div class="modal-footer">
                            
                            <form id="reset_permissions" class="me-auto">
                                <input type="hidden" name="containerID" value="${containerID}">
                                <button type="button" class="btn btn-danger" data-bs-dismiss="modal" name="reset_permissions" id="submit" hx-post="/dashboard/action/update_permissions/${containerID}" hx-confirm="Are you sure you want to reset permissions for this container?">Reset</button>
                            </form>
    
                            <button type="button" class="btn" data-bs-dismiss="modal">Close</button>
                        </div>`
        res.send(modal);
        return;
    }   

    // Logs modal
    if (view == 'logs') {
        let logs = await containerLogs(containerID);
        let modal = readFileSync('./views/partials/logs.html', 'utf8');
        modal = modal.replace(/AppName/g, container_name);
        modal = modal.replace(/ContainerID/g, containerID);
        modal = modal.replace(/ContainerLogs/g, logs);
        res.send(modal);
        return;
    }

    // Details modal
    if (view == 'details') {
        let container = await containerInfo(containerID);
        let modal = readFileSync('./views/partials/details.html', 'utf8');
        modal = modal.replace(/AppName/g, container.containerName);
        modal = modal.replace(/AppImage/g, container.containerImage);
        for (let i = 0; i <= 6; i++) {
            modal = modal.replaceAll(`Port${i}Check`, container.ports[i]?.check || '');
            modal = modal.replaceAll(`Port${i}External`, container.ports[i]?.external || '');
            modal = modal.replaceAll(`Port${i}Internal`, container.ports[i]?.internal || '');
            modal = modal.replaceAll(`Port${i}Protocol`, container.ports[i]?.protocol || '');
        }
        for (let i = 0; i <= 6; i++) {
            modal = modal.replaceAll(`Vol${i}Source`, container.volumes[i]?.Source || '');
            modal = modal.replaceAll(`Vol${i}Destination`, container.volumes[i]?.Destination || '');
            modal = modal.replaceAll(`Vol${i}RW`, container.volumes[i]?.RW || '');
        }
        for (let i = 0; i <= 19; i++) {
            modal = modal.replaceAll(`Label${i}Key`, Object.keys(container.labels)[i] || '');
            modal = modal.replaceAll(`Label${i}Value`, Object.values(container.labels)[i] || '');
        }
        for (let i = 0; i <= 19; i++) {
            modal = modal.replaceAll(`Env${i}Key`, container.env[i]?.split('=')[0] || '');
            modal = modal.replaceAll(`Env${i}Value`, container.env[i]?.split('=')[1] || '');
        }
        res.send(modal);
        return;
    }

    // Uninstall modal
    if (view == 'uninstall') {
        let modal = readFileSync('./views/partials/uninstall.html', 'utf8');
        modal = modal.replace(/AppName/g, container_name);
        modal = modal.replace(/ContainerID/g, containerID);
        res.send(modal);
        return;
    }
    
    // Update link modal
    if (view == 'link_modal') {
        const [container, created] = await Container.findOrCreate({ where: { containerID: containerID }, defaults: { containerName: container_name, containerID: containerID, link: '' } });

        if (created) { console.log(`Link_modal: Created entry for container ${container_name}`); }

        let modal = readFileSync('./views/partials/link.html', 'utf8');
        modal = modal.replace(/AppName/g, container_name);
        modal = modal.replace(/ContainerID/g, containerID);
        modal = modal.replace(/AppLink/g, container.link);
        res.send(modal);
        return;
    }

    // Update container_card
    if (view == 'update_card'){

        let lists = await ContainerLists.findOne({ where: { userID: req.session.userID }, attributes: ['containers'] });
        let container_list = JSON.parse(lists.containers);

        let found = container_list.find(c => c.containerID === containerID);
        if (!found) { res.send(''); console.log(`[update_card] card not found in ContainerLists[db]`); return; }
        let details = await containerInfo(containerID);
        let card = await createCard(details);
        res.send(card);
        return;
    }
    
    // Generates the cards for the dashboard. Triggered on page load and whenever a change triggers sse.
    if (view == 'card_list'){
        let cards_list = '';
        // Check if there are any new cards in queue.
        let new_cards = await ContainerLists.findOne({ where: { userID: req.session.userID }, attributes: ['new'] });
        new_cards = JSON.parse(new_cards.new);
        // Check what containers the user should see.
        let containers = await userCards(req);
        // Create the cards.
        if (new_cards.length > 0) {
            for (let i = 0; i < new_cards.length; i++) {
                let details = await containerInfo(new_cards[i]);
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
        return;
    }

    
}



// Container actions (start, stop, pause, restart, hide)
export const DashboardAction = async (req, res) => {

    // let trigger_id = req.header('hx-trigger');
    let container_name = req.header('hx-trigger-name');
    let action = req.params.action;
    let containerID = req.params.id;

    // console.log(`[container_name] ${container_name} [action] ${action} [containerID] ${containerID}`);

    // Reset view settings
    if (action == 'reset') { 
        console.log('Resetting view');
        await Permission.update({ hide: false }, { where: { userID: req.session.userID } });
        req.session.alert = Alert('success', 'View settings reset.');
        res.redirect('/dashboard');
        return;
    } else if (action == 'update_link') {
        let url = req.body.url;
        let container = await Container.findOne({ where: { containerID: containerID } });
        container.update({ link: url });
        res.redirect('/dashboard');
        return;
    } else if (action == 'update_permissions') {
        let { userID, username, reset_permissions, select } = req.body;
        let button_id = req.header('hx-trigger');
        // Replaces the update button if it's been pressed.
        if (button_id == 'confirmed') { res.send(`<button class="btn" type="button" id="submit" hx-post="/dashboard/action/update_permissions/${containerID}" hx-swap="outerHTML">Update  </button>`); return; }
        // Reset all permissions for the container.
        if (reset_permissions == '') { await Permission.update({ uninstall: false, edit: false, upgrade: false, start: false, stop: false, pause: false, restart: false, logs: false, view: false }, { where: { containerID: containerID } }); trigger_docker_event(); return; }
        // Make sure req.body[select] is an array
        if (typeof req.body[select] == 'string') { req.body[select] = [req.body[select]]; }
    
        await Permission.update({ uninstall: false, edit: false, upgrade: false, start: false, stop: false, pause: false, restart: false, logs: false, view: false }, { where: { containerID: containerID, userID: userID } });
        if (req.body[select]) {
            for (let i = 0; i < req.body[select].length; i++) {
                let permissions = req.body[select][i];
                if (permissions == 'uninstall') { await Permission.update({ uninstall: true }, { where: {containerID: containerID, userID: userID}}); }  
                if (permissions == 'edit') { await Permission.update({ edit: true }, { where: {containerID: containerID, userID: userID}}); }   
                if (permissions == 'upgrade') { await Permission.update({ upgrade: true }, { where: {containerID: containerID, userID: userID}}); }   
                if (permissions == 'start') { await Permission.update({ start: true }, { where: {containerID: containerID, userID: userID}}); }   
                if (permissions == 'stop') { await Permission.update({ stop: true }, { where: {containerID: containerID, userID: userID}}); }   
                if (permissions == 'pause') { await Permission.update({ pause: true }, { where: {containerID: containerID, userID: userID}}); }   
                if (permissions == 'restart') { await Permission.update({ restart: true }, { where: {containerID: containerID, userID: userID}}); }   
                if (permissions == 'logs') { await Permission.update({ logs: true }, { where: {containerID: containerID, userID: userID}}); }
                if (permissions == 'view') { await Permission.update({ view: true }, { where: {containerID: containerID, userID: userID}}); }
            }
        }
        trigger_docker_event();
        res.send(`<button class="btn" type="button" id="confirmed" hx-post="/dashboard/action/update_permissions/${containerID}" hx-swap="outerHTML" hx-trigger="load delay:1s">Update ✔️</button>`);
        return;
    }

    let info = await Container.findOne({ where: { containerID: containerID } });
    let host = info.host;

    if (host == 1) { info = docker.getContainer(containerID); }
    if (host == 2) { info = docker2.getContainer(containerID); }
    if (host == 3) { info = docker3.getContainer(containerID); }
    if (host == 4) { info = docker4.getContainer(containerID); }
    if (host == 5) { info = docker5.getContainer(containerID); }
    if (host == 6) { info = docker6.getContainer(containerID); }
    if (host == 7) { info = docker7.getContainer(containerID); }
    if (host == 8) { info = docker8.getContainer(containerID); }

    let container = await info.inspect();
    let containerState = container.State.Status;
    
    // Displays container state (starting, stopping, restarting, pausing)
    function status (state) {
        return(`<div class="text-yellow d-inline-flex align-items-center lh-1 ms-auto" id="AltIDState">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon-tabler icon-tabler-point-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"> <path stroke="none" d="M0 0h24v24H0z" fill="none"></path> <path d="M12 7a5 5 0 1 1 -4.995 5.217l-.005 -.217l.005 -.217a5 5 0 0 1 4.995 -4.783z" stroke-width="0" fill="currentColor"></path></svg>
                <strong>${state}</strong>
                </div>`);
    }

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


// Server metrics (CPU, RAM, TX, RX, DISK)
export const ServerMetrics = async (req, res) => {
    let name = req.header('hx-trigger-name');
    let color = req.header('hx-trigger');
    let value = 0;
    switch (name) {
        case 'CPU': 
            value = cpu;
            break;
        case 'RAM': 
            value = ram;
            break;
        case 'NET':
            let net = `<div class="font-weight-medium"><label class="cpu-text mb-1">Down:${down}MB  Up:${up}MB</label></div>
                        <div class="cpu-bar meter animate ${color}"><span style="width:20%"><span></span></span></div>`;           
            res.send(net);
            return;
        case 'DISK':
            value = disk;
            break;
    }
    let info = `<div class="font-weight-medium"> <label class="cpu-text mb-1">${name} ${value}%</label></div>
                <div class="cpu-bar meter animate ${color}"><span style="width:${value}%"><span></span></span></div>`;
    res.send(info);
}


let [cpu, ram, down, up, percent, disk] = [0, 0, 0, 0, 0, 0];
export async function getMetrics () {
    ( async () => {
        await currentLoad().then(data => { cpu = Math.round(data.currentLoad); });
    })();

    ( async () => {
        await mem().then(data => { ram = Math.round((data.active / data.total) * 100); });
    })();

    ( async () => {
        await networkStats().then(data => { down = Math.round(data[0].rx_bytes / (1024 * 1024)); up = Math.round(data[0].tx_bytes / (1024 * 1024)); percent = Math.round((down / 1000) * 100); });
    })();

    ( async () => {
        await fsSize().then(data => { disk = data[0].use; });
    })();
}

setInterval(async() => {
    await getMetrics();
}, 1000);







export const searchDashboard = async function (req, res) {
    console.log(`[Search] ${req.body.search}`);
    res.send('ok');
    return;
}

async function createCard (details) {
    let { containerName, containerID, containerState, containerService } = details;
    // Hacky way of letting me use the containerID. HTML element IDs have to start with a letter.
    let AltID = `a${containerID}`;
    // Shorten the container name if it's longer than 14 characters.
    let containerTitle = Capitalize(containerName); if (containerTitle.length > 14) { containerTitle = containerTitle.substring(0, 14) + '...'; }
    // HTMX trigger every 3 seconds to update the chart.
    let chart_trigger = `<div name="${containerName}" id="${AltID}info" hx-get="/dashboard/view/chart/${containerID}" hx-swap="outerHTML" hx-trigger="every 3s" hx-target="#${AltID}info"></div>`;
    // Set the color of the container state.
    let stateColor = { 'running': 'green', 'exited': 'red', 'paused': 'orange', 'created': 'blue' };
    let containerStateColor = stateColor[containerState] || 'blue';
    // Change the state to 'stopped' and remove the chart trigger if the container is 'exited'.
    if (containerState == 'exited') { containerState = 'stopped'; chart_trigger = ''; }
    // Check if the container title has a link set.
    let [title_link, created] = await Container.findOrCreate({ where: { containerID: details.containerID }, defaults: { containerName: containerName, containerID: containerID, link: '', cpu: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]', ram: '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]' } });
    if (title_link.link != '') { title_link = `<a href="${title_link.link}" class="nav-link" target="_blank">${containerTitle}</a>`; }
    else { title_link = containerTitle; }
    
    if (created) { console.log(`title_link: Created entry for container ${containerName}`); }
    
    // Get the base URL for the port links.
    let [port_link, created_link] = await ServerSettings.findOrCreate({ where: { key: 'port_link' }, defaults: { key: 'port_link', value: 'http://localhost' } });
    port_link = port_link.value;

    let exposed_ports = '';
    for (let i = 0; i < details.ports.length; i++) {
        if (details.ports[i].external != '' && details.ports[i].protocol != 'udp') { exposed_ports += `<a href="${port_link}:${details.ports[i].external}" target="_blank" style="color: inherit; text-decoration: none;"> ${details.ports[i].external}</a> `; }
    }

    let container_card = readFileSync('./views/partials/container_card.html', 'utf8');
    container_card = container_card.replace(/AppName/g, containerName);
    container_card = container_card.replace(/ContainerID/g, containerID);
    container_card = container_card.replaceAll(/AltID/g, AltID);
    container_card = container_card.replace(/AppPorts/g, exposed_ports);
    container_card = container_card.replace(/TitleLink/g, title_link);
    container_card = container_card.replace(/AppTitle/g, containerTitle);
    container_card = container_card.replace(/AppService/g, containerService);
    container_card = container_card.replace(/AppState/g, containerState);
    container_card = container_card.replace(/StateColor/g, containerStateColor);
    container_card = container_card.replace(/ChartTrigger/g, chart_trigger);

    return container_card;
}