import { docker } from '../server.js';

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
    let containers = await docker.listContainers({ all: true });

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
    let list = await docker.listVolumes({ all: true });
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

    
    res.render("volumes", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.user.charAt(0).toUpperCase(),
        volume_list: volume_list,
        volume_count: volumes.length,
        alert: '',
        link1: '',
        link2: '',
        link3: '',
        link4: '',
        link5: '',
        link6: '',
        link7: '',
        link8: '',
        link9: '',
    });

}

export const addVolume = async function(req, res) {
    
    let volume = req.body.volume;

    docker.createVolume({
        Name: volume
    });
    res.redirect("/volumes");
}


export const removeVolume = async function(req, res) {
    let volumes = req.body.select;
    
    if (typeof(volumes) == 'string') {
        volumes = [volumes];
    }

    for (let i = 0; i < volumes.length; i++) {
        
        if (volumes[i] != 'on') {
            try {
                console.log(`Removing volume: ${volumes[i]}`);
                let volume = docker.getVolume(volumes[i]);
                await volume.remove();
            } catch (error) {
                console.log(`Unable to remove volume: ${volumes[i]}`);
            }
        }
    }

    res.redirect("/volumes");
}


// docker.df(volume.Name).then((data) => {
//     for (let key in data) {
//         console.log(data[key]);
//     }
// });
