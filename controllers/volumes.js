import { Alert, getLanguage, Navbar } from '../utils/system.js';
import { volumeList, containerList } from '../utils/docker.js';

export const Volumes = async function(req, res) {
    let container_volumes = [];
    let volume_list = '';

    // Table header
    volume_list = `<thead>
                        <tr>
                            <th class="w-1"><input class="form-check-input m-0 align-middle" name="select" type="checkbox" aria-label="Select all" onclick="selectAll()"></th>
                            <th><label class="table-sort" data-sort="sort-type">Type</label></th>
                            <th><label class="table-sort" data-sort="sort-name">Name</label></th>
                            <th><label class="table-sort" data-sort="sort-city">Mount point</label></th>
                            <th><label class="table-sort" data-sort="sort-score">Status</label></th>
                            <th><label class="table-sort" data-sort="sort-date">Created</label></th>
                            <th><label class="table-sort" data-sort="sort-quantity">Size</label></th>
                            <th><label class="table-sort" data-sort="sort-progress">Action</label></th>
                        </tr>
                    </thead>
                    <tbody class="table-tbody">`

    // List all containers
    let containers = await containerList();

    // Get the first 6 volumes from each container
    for (let i = 0; i < containers.length; i++) {
        try { container_volumes.push({type: containers[i].Mounts[0].Type, source: containers[i].Mounts[0].Source}); } catch { } 
        try { container_volumes.push({type: containers[i].Mounts[1].Type, source: containers[i].Mounts[1].Source}); } catch { }
        try { container_volumes.push({type: containers[i].Mounts[2].Type, source: containers[i].Mounts[2].Source}); } catch { }
        try { container_volumes.push({type: containers[i].Mounts[3].Type, source: containers[i].Mounts[3].Source}); } catch { }
        try { container_volumes.push({type: containers[i].Mounts[4].Type, source: containers[i].Mounts[4].Source}); } catch { }
        try { container_volumes.push({type: containers[i].Mounts[5].Type, source: containers[i].Mounts[5].Source}); } catch { }
    }
    
    // List ALL volumes
    let list = await volumeList();
    let volumes = list.Volumes;

    // Create a table row for each volume
    for (let i = 0; i < volumes.length; i++) {
        let volume = volumes[i];
        let name = "" + volume.Name;
        let mount = "" + volume.Mountpoint;
        let type = "Bind";

        // Check if the volume is being used by any of the containers
        let status = '';
        if (container_volumes.some(volume => volume.source === mount)) { status = "In use"; }
        if (container_volumes.some(volume => volume.source === mount && volume.type === 'volume')) { type = "Volume"; }

        let row = `
        <tr>
            <td><input class="form-check-input m-0 align-middle" name="select" value="${name}" type="checkbox" aria-label="Select"></td>
            <td class="sort-type">${type}</td>
            <td class="sort-name">${name}</td>
            <td class="sort-city">${mount}</td>
            <td class="sort-score text-green">${status}</td>
            <td class="sort-date" data-date="1628122643">${volume.CreatedAt}</td>
            <td class="sort-quantity">MB</td>
            <td class="text-end"><a class="btn" href="#">Details</a></td>
        </tr>`
    
        volume_list += row;    
    }

    volume_list += `</tbody>`

    res.render("volumes",{ 
        alert: '',
        username: req.session.username,
        role: req.session.role,
        volume_count: '',
        volume_list: volume_list,
        navbar: await Navbar(req),
    });
}



export const submitVolumes = async function(req,res){

    // console.log(req.body);

    let trigger_name = req.header('hx-trigger-name');
    let trigger_id = req.header('hx-trigger');

    console.log(`trigger_name: ${trigger_name} - trigger_id: ${trigger_id}`);


    res.render("volumes",{
        alert: '',
        username: req.session.username,
        role: req.session.role,
        volume_count: '',
        volume_list: '',
        navbar: await Navbar(req),
    });

}