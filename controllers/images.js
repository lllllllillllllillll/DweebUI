import { docker } from '../server.js';

export const Images = async function(req, res) {

    let images = await docker.listImages({ all: true });

    let image_list = `
    <thead>
        <tr>
            <th class="w-1"><input class="form-check-input m-0 align-middle" name="select" type="checkbox" aria-label="Select all" onclick="selectAll()"></th>
            <th><button class="table-sort" data-sort="sort-name">Name</button></th>
            <th><button class="table-sort" data-sort="sort-city">ID</button></th>
            <th><button class="table-sort" data-sort="sort-type">Tag</button></th>
            <th><button class="table-sort" data-sort="sort-score">Status</button></th>
            <th><button class="table-sort" data-sort="sort-date">Created</button></th>
            <th><button class="table-sort" data-sort="sort-quantity">Size</button></th>
            <th><button class="table-sort" data-sort="sort-progress">Action</button></th>
        </tr>
    </thead>
    <tbody class="table-tbody">`


    for (let i = 0; i < images.length; i++) {

        let date = new Date(images[i].Created * 1000);
        let created = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        let size = images[i].Size / 1000 / 1000; // to match docker desktop
        size = size.toFixed(2);

        let details = `
            <tr>
                <td><input class="form-check-input m-0 align-middle" name="select" value="${images[i].RepoTags}" type="checkbox" aria-label="Select"></td>
                <td class="sort-name">${images[i].RepoTags}</td>
                <td class="sort-city">${images[i].Id}</td>
                <td class="sort-type">Latest</td>
                <td class="sort-score text-green">In use</td>
                <td class="sort-date" data-date="1628122643">${created}</td>
                <td class="sort-quantity">${size} MB</td>
                <td class="text-end"><a class="btn" href="#">Details</a></td>
            </tr>`
        image_list += details;
    }
    
    image_list += `</tbody>`

    
    res.render("images", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.avatar,
        image_list: image_list,
        image_count: images.length
    });

}