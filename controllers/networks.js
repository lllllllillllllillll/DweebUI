import { Alert, getLanguage, Navbar, Footer } from '../utils/system.js';
import { networkList, GetContainerLists, removeNetwork } from '../utils/docker.js';

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
        // Create the row for the network entry
        let details = `
            <tr>
                <td><input class="form-check-input m-0 align-middle" name="select" value="${networks[i].Id}" type="checkbox" aria-label="Select"></td>
                <td class="sort-name">${networks[i].Name}</td>
                <td class="sort-city">${networks[i].Id}</td>
                <td class="sort-score text-green">${status}</td>
                <td class="sort-date" data-date="1628122643">${networks[i].Created}</td>
                <td class="text-end"><a class="btn" href="#">Details</a></td>
            </tr>`
            // Add the row to the network list
            network_list += details;
    }

    res.render("networks",{ 
        alert: '',
        username: req.session.username,
        role: req.session.role,
        network_count: '',
        network_list: network_list,
        navbar: await Navbar(req),
        footer: await Footer(req),
    });
}



export const NetworkAction = async function(req,res){

    // let trigger_name = req.header('hx-trigger-name');
    // let trigger_id = req.header('hx-trigger');
    // console.log(`trigger_name: ${trigger_name} - trigger_id: ${trigger_id}`);
    // console.log(req.body);


    // Grab the list of networks
    let networks = req.body.select;
    // Make sure the value is an array
    if (typeof(networks) == 'string') { networks = [networks]; }
    // Loop through the array
    for (let i = 0; i < networks.length; i++) {
        if (networks[i] != 'on') {
            try {
                await removeNetwork(networks[i]);
                console.log(`Network removed: ${networks[i]}`);
            } 
            catch {
                console.log(`Unable to remove network: ${networks[i]}`);
            }
        }
    }

    res.redirect("/networks");
}



export const searchNetworks = async function (req, res) {
    console.log(`[Search] ${req.body.search}`);
    res.send('ok');
    return;
}