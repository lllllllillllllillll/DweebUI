import { docker } from '../server.js';


export const Networks = async function(req, res) {
    let container_networks = [];
    let network_name = '';
    // List all containers
    let containers = await docker.listContainers({ all: true });
    // Loop through the containers to find out which networks are being used
    for (let i = 0; i < containers.length; i++) {
        // console.log(Object.keys(containers[i].NetworkSettings.Networks)[0]);
        try { network_name += containers[i].HostConfig.NetworkMode; } catch {}
        try { container_networks.push(containers[i].NetworkSettings.Networks[network_name].NetworkID); } catch {}
    }
    // List all networks
    let networks = await docker.listNetworks({ all: true });
    // Uses template literals to build the networks table
    let network_list = `
        <thead>
            <tr>
                <th class="w-1"><input class="form-check-input m-0 align-middle" name="select" type="checkbox" aria-label="Select all" onclick="selectAll()"></th>
                <th><label class="table-sort" data-sort="sort-name">Name</label></th>
                <th><label class="table-sort" data-sort="sort-city">ID</label></th>
                <th><label class="table-sort" data-sort="sort-score">Status</label></th>
                <th><label class="table-sort" data-sort="sort-date">Created</label></th>
                <th><label class="table-sort" data-sort="sort-progress">Action</label></th>
            </tr>
        </thead>
        <tbody class="table-tbody">`

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
    network_list += `</tbody>`

    res.render("networks", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.user.charAt(0).toUpperCase(),
        network_list: network_list,
        network_count: networks.length,
        alert: '',
    });
}

export const removeNetwork = async function(req, res) {
    // Grab the list of networks
    let networks = req.body.select;
    // Make sure the value is an array
    if (typeof(networks) == 'string') { networks = [networks]; }
    // Loop through the array
    for (let i = 0; i < networks.length; i++) {
        if (networks[i] != 'on') {
            try {
                let network = docker.getNetwork(networks[i]);
                await network.remove();
            } 
            catch {
                console.log(`Unable to remove network: ${networks[i]}`);
            }
        }
    }
    res.redirect("/networks");
}