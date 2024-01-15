import { docker } from '../server.js';


export const Networks = async function(req, res) {

    let networks = await docker.listNetworks({ all: true });

    let network_list = `
        <thead>
            <tr>
                <th class="w-1"><input class="form-check-input m-0 align-middle" name="select" type="checkbox" aria-label="Select all" onclick="selectAll()"></th>
                <th><button class="table-sort" data-sort="sort-name">Name</button></th>
                <th><button class="table-sort" data-sort="sort-city">ID</button></th>
                <th><button class="table-sort" data-sort="sort-score">Status</button></th>
                <th><button class="table-sort" data-sort="sort-date">Created</button></th>
                <th><button class="table-sort" data-sort="sort-progress">Action</button></th>
            </tr>
        </thead>
    <tbody class="table-tbody">`


    for (let i = 0; i < networks.length; i++) {

        // let date = new Date(images[i].Created * 1000);
        // let created = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    

        let details = `
            <tr>
                <td><input class="form-check-input m-0 align-middle" name="select" value="" type="checkbox" aria-label="Select"></td>
                <td class="sort-name">${networks[i].Name}</td>
                <td class="sort-city">${networks[i].Id}</td>
                <td class="sort-score text-green">In use</td>
                <td class="sort-date" data-date="1628122643">${networks[i].Created}</td>
                <td class="text-end"><a class="btn" href="#">Details</a></td>
            </tr>`
            network_list += details;
    }
    
    network_list += `</tbody>`

    
    res.render("networks", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.avatar,
        network_list: network_list,
        network_count: networks.length
    });

}