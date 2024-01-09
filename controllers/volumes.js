import { docker } from '../app.js';


export const Volumes = async function(req, res) {

    let list = await docker.listVolumes({ all: true });
    let volumes = list.Volumes;

    let volume_list = `
    <thead>
        <tr>
            <th class="w-1"><input class="form-check-input m-0 align-middle" name="select" type="checkbox" aria-label="Select all" onclick="selectAll()"></th>
            <th><button class="table-sort" data-sort="sort-name">Name</button></th>
            <th><button class="table-sort" data-sort="sort-city">Mount point</button></th>
            <th><button class="table-sort" data-sort="sort-score">Status</button></th>
            <th><button class="table-sort" data-sort="sort-date">Created</button></th>
            <th><button class="table-sort" data-sort="sort-quantity">Size</button></th>
            <th><button class="table-sort" data-sort="sort-progress">Action</button></th>
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
            <td><input class="form-check-input m-0 align-middle" name="select" value="" type="checkbox" aria-label="Select"></td>
            <td class="sort-name">${name}</td>
            <td class="sort-city">${mount}</td>
            <td class="sort-score text-green">In use</td>
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
        avatar: req.session.avatar,
        volume_list: volume_list,
        volume_count: volumes.length
    });

}