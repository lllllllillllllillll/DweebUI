import { Alert, Navbar, Footer } from '../sys/utils.js';
import { networkList, GetContainerLists, removeNetwork } from '../sys/docker.js';

export const Networks = async function(req, res) {
    
    let container_networks = [];
    let network_name = '';

    let containers = await GetContainerLists();

    for (let i = 0; i < containers.length; i++) {

        try { network_name += containers[i].HostConfig.NetworkMode; } catch {}
        try { container_networks.push(containers[i].NetworkSettings.Networks[network_name].NetworkID); } catch {}
    }

    let networks = await networkList();

    let network_list = '';

    for (let i = 0; i < networks.length; i++) {

        let status = '';

        // Check if the network is in use
        try { if (container_networks.includes(networks[i].Id)) { status = `In use`; } } catch {}

        let date = new Date(networks[i].Created);
        let created = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        // Create the row for the network entry
        let details = `
            <tr>
                <td><input class="form-check-input m-0 align-middle" name="select" value="${networks[i].Id}" type="checkbox" aria-label="Select"></td>
                <td class="sort-name">${networks[i].Name}</td>
                <td class="sort-city">${networks[i].Id}</td>
                <td class="sort-score text-green">${status}</td>
                <td class="sort-date" data-date="1628122643">${created}</td>
                <td class=""><button class="badge badge-outline text-grey" id="" data-hx-get="/users/usersModals/user/" hx-target="#modal_content"  hx-swap="innerHTML" data-bs-toggle="modal" data-bs-target="#scrolling_modal">Details</button></td>
            </tr>`
            // Add the row to the network list
            network_list += details;
    }

    res.render("networks",{ 
        alert: req.session.alert,
        username: req.session.username,
        role: req.session.role,
        network_count: networks.length,
        network_list: network_list,
        navbar: await Navbar(req),
        footer: await Footer(req),
    });
}



export const NetworksAction = async function(req,res){

    let action = req.params.action;
    let id = req.params.id;

    console.log(`Action: ${action} - ID: ${id}`);
    
    // Grab the list of networks
    let networks = req.body.select;

    // Make sure the value is an array
    if (typeof(networks) == 'string') { networks = [networks]; }

    // Loop through the array
    for (let i = 0; i < networks.length; i++) {

        // Ignore the selectAll checkbox
        if (networks[i] == 'on') { continue; }

        // Remove
        if (action == 'remove') {
            try {
                await removeNetwork(networks[i]);
            } 
            catch {            }
        }


    }

    // Create an alert
    req.session.alert = Alert('success', 'Networks updated');

    // Refresh the page
    res.redirect("/networks");
}



export const searchNetworks = async function (req, res) {
    console.log(`[Search] ${req.body.search}`);
    res.send('ok');
    return;
}