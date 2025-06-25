import { Alert, Navbar, Footer } from '../sys/utils.js';
import { volumeList, removeVolume, GetContainerLists } from '../sys/docker.js';

export const Volumes = async function(req, res) {

    let container_volumes = [];
    let volume_list = '';

    // Get a list of volumes attached to containers
    let containers = await GetContainerLists();

    // Get the first 6 volumes from each container
    for (let i = 0; i < containers.length; i++) {
        try { container_volumes.push({type: containers[i].Mounts[0].Type, source: containers[i].Mounts[0].Source}); } catch { } 
        try { container_volumes.push({type: containers[i].Mounts[1].Type, source: containers[i].Mounts[1].Source}); } catch { }
        try { container_volumes.push({type: containers[i].Mounts[2].Type, source: containers[i].Mounts[2].Source}); } catch { }
        try { container_volumes.push({type: containers[i].Mounts[3].Type, source: containers[i].Mounts[3].Source}); } catch { }
        try { container_volumes.push({type: containers[i].Mounts[4].Type, source: containers[i].Mounts[4].Source}); } catch { }
        try { container_volumes.push({type: containers[i].Mounts[5].Type, source: containers[i].Mounts[5].Source}); } catch { }
    }
    
    // Get the list of all volumes
    let list = await volumeList();
    let volumes = list.Volumes;

    // Create a table row for each volume
    for (let i = 0; i < volumes.length; i++) {
        let volume = volumes[i];
        let name = "" + volume.Name;
        let mount = "" + volume.Mountpoint;
        let type = "Bind";

        let date = new Date(volume.CreatedAt);
        let created = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        // Check if the volume is being used by any of the containers
        let status = '';
        if (container_volumes.some(volume => volume.source === mount)) { status = "In use"; }
        if (container_volumes.some(volume => volume.source === mount && volume.type === 'volume')) { type = "Volume"; }

        let row = `
        <tr>
            <td><input class="form-check-input m-0 align-middle" name="select" value="${name}" type="checkbox" aria-label="Select"></td>
            <td class="sort-name">${name}</td>
            <td class="sort-type">${type}</td>
            <td class="sort-city">${mount}</td>
            <td class="sort-score text-green">${status}</td>
            <td class="sort-quantity">MB</td>
            <td class="sort-date" data-date="1628122643">${created}</td>
            <td class=""><button class="badge badge-outline text-grey" id="" data-hx-get="/users/usersModals/user/" hx-target="#modal_content"  hx-swap="innerHTML" data-bs-toggle="modal" data-bs-target="#scrolling_modal">Details</button></td>
        </tr>`
    
        volume_list += row;    
    }

    res.render("volumes",{ 
        alert: '',
        username: req.session.username,
        role: req.session.role,
        volume_count: volumes.length,
        volume_list: volume_list,
        navbar: await Navbar(req),
        footer: await Footer(req),
    });
}



export const searchVolumes = async function (req, res) {
    console.log(`[Search] ${req.body.search}`);
    res.send('ok');
    return;
}


export const VolumesView = async function(req,res){
    // something
}


export const VolumesAction = async function(req,res){

    let action = req.params.action;
    let id = req.params.id;
    
    // Grab the list of volumes
    let volumes = req.body.select;

    // Make sure the value is an array
    if (typeof(volumes) == 'string') { volumes = [volumes]; }

    // Loop through the array
    for (let i = 0; i < volumes.length; i++) {

        // Ignore the selectAll checkbox
        if (volumes[i] == 'on') { continue; }

        // Remove
        if (action == 'remove') {
            try {
                await removeVolume(volumes[i], req.session.host);
            } 
            catch { }
        }

        // Create
        // if (action == 'create') {
        //     try {
        //         await createVolume(volumes[i]);
        //         console.log(`Volume created: ${volumes[i]}`);
        //     } 
        //     catch {
        //         console.log(`Unable to create volume: ${volumes[i]}`);
        //     }
        // }


    }

    req.session.alert = Alert('success', 'Volume action completed successfully.');
    res.redirect('/volumes');
}