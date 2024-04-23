import { docker } from '../server.js';


export const Volumes = async function(req, res) {

    let list = await docker.listVolumes({ all: true });
    let volumes = list.Volumes;

    let volume_list = `
    <thead>
        <tr>
            <th class="w-1"><input class="form-check-input m-0 align-middle" name="select" type="checkbox" aria-label="Select all" onclick="selectAll()"></th>
            <th><label class="table-sort" data-sort="sort-name">Name</label></th>
            <th><label class="table-sort" data-sort="sort-city">Mount point</label></th>
            <th><label class="table-sort" data-sort="sort-score">Status</label></th>
            <th><label class="table-sort" data-sort="sort-date">Created</label></th>
            <th><label class="table-sort" data-sort="sort-quantity">Size</label></th>
            <th><label class="table-sort" data-sort="sort-progress">Action</label></th>
        </tr>
    </thead>
    <tbody class="table-tbody">`



    for (let i = 0; i < volumes.length; i++) {
        let volume = volumes[i];
        let name = volume.Name;
        let mount = volume.Mountpoint;

        if (name.length > 40) {
            name = name.slice(0, 37) + '...';
        }

        if (mount.length > 70) {
            mount = mount.slice(0, 67) + '...';
        }
        
        // docker.df(volume.Mountpoint).then((data) => {
        //     for (let key in data) {
        //         console.log(data[key]);
        //     }
        // });

    
        let details = `
        <tr>
            <td><input class="form-check-input m-0 align-middle" name="select" value="${name}" type="checkbox" aria-label="Select"></td>
            <td class="sort-name">${name}</td>
            <td class="sort-city">${mount}</td>
            <td class="sort-score text-green"> - </td>
            <td class="sort-date" data-date="1628122643">${volume.CreatedAt}</td>
            <td class="sort-quantity">MB</td>
            <td class="text-end"><a class="btn" href="#">Details</a></td>
        </tr>`
    
        volume_list += details;    
    }

    volume_list += `</tbody>`

    
    res.render("volumes", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.user.charAt(0).toUpperCase(),
        volume_list: volume_list,
        volume_count: volumes.length,
        alert: '',
    });

}

export const createVolume = async function(req, res) {
    
    let name = req.body.name;

    docker.createVolume({
        Name: name
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