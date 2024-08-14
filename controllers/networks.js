import { Alert, getLanguage, Navbar } from '../utils/system.js';
import { networkList, containerList } from '../utils/docker.js';

export const Networks = async function(req, res) {

    let container_networks = [];
    let network_name = '';

    let containers = await containerList();

    for (let i = 0; i < containers.length; i++) {

        try { network_name += containers[i].HostConfig.NetworkMode; } catch {}
        try { container_networks.push(containers[i].NetworkSettings.Networks[network_name].NetworkID); } catch {}
    }

    let networks = await networkList();

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


    res.render("networks",{ 
        alert: '',
        username: req.session.username,
        role: req.session.role,
        network_count: '',
        network_list: network_list,
        navbar: await Navbar(req),
    });
}



export const submitNetworks = async function(req,res){

    // console.log(req.body);

    let trigger_name = req.header('hx-trigger-name');
    let trigger_id = req.header('hx-trigger');

    console.log(`trigger_name: ${trigger_name} - trigger_id: ${trigger_id}`);



    res.render("networks",{
        alert: '',
        username: req.session.username,
        role: req.session.role,
        network_count: '',
        network_list: '',
        navbar: await Navbar(req),
    });

}