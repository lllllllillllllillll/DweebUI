import { docker } from '../app.js';
import { dockerImages } from 'systeminformation';

export const Images = async function(req, res) {

    let images = await dockerImages({ all: true });

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

    let image = `
        <tr>
            <td><input class="form-check-input m-0 align-middle" name="select" value="" type="checkbox" aria-label="Select"></td>
            <td class="sort-name">${images[i].repoTags}</td>
            <td class="sort-city">${images[i].id}</td>
            <td class="sort-type">Latest</td>
            <td class="sort-score text-green">In use</td>
            <td class="sort-date" data-date="1628122643">August 05, 2021</td>
            <td class="sort-quantity">69.27 MB</td>
            <td class="text-end"><a class="btn" href="#">Details</a></td>
        </tr>`

 
        image_list += image;
    }
    
    image_list += `</tbody>`

    
    res.render("images", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.avatar,
        image_list: image_list
    });

}