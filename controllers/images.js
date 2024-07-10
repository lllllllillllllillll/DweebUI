import { docker } from '../server.js';
import { addAlert } from './dashboard.js';

export const Images = async function(req, res) {

    let action = req.params.action;

    console.log(req.params.host);

    if (action == "remove") {
        let images = req.body.select;

        if (typeof(images) == 'string') {
            images = [images];
        }

        for (let i = 0; i < images.length; i++) {
            if (images[i] != 'on') {
                try {
                    console.log(`Removing image: ${images[i]}`);
                    let image = docker.getImage(images[i]);
                    await image.remove();
                } catch (error) {
                    console.log(`Unable to remove image: ${images[i]}`);
                }
            }
        }
        res.redirect("/images");
        return;
    } else if (action == "add") {
        let image = req.body.image;
        let tag = req.body.tag || 'latest';

        try {
            console.log(`Pulling image: ${image}:${tag}`);
            await docker.pull(`${image}:${tag}`);
        } catch (error) {
            console.log(`Unable to pull image: ${image}:${tag}`);
        }
        res.redirect("/images");
        return;
    }

    let containers = await docker.listContainers({ all: true });
    let container_images = [];
    for (let i = 0; i < containers.length; i++) {
        container_images.push(containers[i].Image);
    }

    let images = await docker.listImages({ all: true });

    let image_list = `
    <thead>
        <tr>
            <th class="w-1"><input class="form-check-input m-0 align-middle" name="select" type="checkbox" aria-label="Select all" onclick="selectAll()"></th>
            <th><label class="table-sort" data-sort="sort-name">Name</label></th>
            <th><label class="table-sort" data-sort="sort-type">Tag</label></th>
            <th><label class="table-sort" data-sort="sort-city">ID</label></th>
            <th><label class="table-sort" data-sort="sort-score">Status</label></th>
            <th><label class="table-sort" data-sort="sort-date">Created</label></th>
            <th><label class="table-sort" data-sort="sort-quantity">Size</label></th>
            <th><label class="table-sort" data-sort="sort-progress">Action</label></th>
        </tr>
    </thead>
    <tbody class="table-tbody">`


    for (let i = 0; i < images.length; i++) {

        let name = '';
        let tag = ''; 
        try { name = images[i].RepoTags[0].split(':')[0]; } catch {}
        try { tag = images[i].RepoTags[0].split(':')[1]; } catch {}

        let date = new Date(images[i].Created * 1000);
        let created = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        let size = images[i].Size / 1000 / 1000; // to match docker desktop
        size = size.toFixed(2);

        let status = '';
        try {
            if (container_images.includes(images[i].RepoTags[0])) {
                status = 'In use';
            }
        } catch {}

        let details = `
            <tr>
                <td><input class="form-check-input m-0 align-middle" name="select" value="${images[i].Id}" type="checkbox" aria-label="Select"></td>
                <td class="sort-name">${name}</td>
                <td class="sort-type">${tag}</td>
                <td class="sort-city">${images[i].Id}</td>
                <td class="sort-score text-green">${status}</td>
                <td class="sort-date" data-date="1628122643">${created}</td>
                <td class="sort-quantity">${size} MB</td>
                <td class="text-end"><a class="btn" href="#"><svg xmlns="http://www.w3.org/2000/svg" class="icon-tabler icon-tabler-player-play" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M7 4v16l13 -8z"></path></svg></a></td>
            </tr>`
        image_list += details;
    }
    
    image_list += `</tbody>`

    
    res.render("images", {
        username: req.session.username,
        role: req.session.role,
        avatar: req.session.username.charAt(0).toUpperCase(),
        image_list: image_list,
        image_count: images.length,
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