import { docker } from '../server.js';

export const Images = async function(req, res) {

    let action = req.params.action;

    if (action == "remove") {
        console.log("Removing images");
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
        console.log("Adding images");
        let image = req.body.image;
        let tag = req.body.tag;

        try {
            console.log(`Pulling image: ${image}:${tag}`);
            await docker.pull(`${image}:${tag}`);
        } catch (error) {
            console.log(`Unable to pull image: ${image}:${tag}`);
        }
        res.redirect("/images");
        return;
    }



    

    let images = await docker.listImages({ all: true });

    let image_list = `
    <thead>
        <tr>
            <th class="w-1"><input class="form-check-input m-0 align-middle" name="select" type="checkbox" aria-label="Select all" onclick="selectAll()"></th>
            <th><label class="table-sort" data-sort="sort-name">Name</label></th>
            <th><label class="table-sort" data-sort="sort-city">ID</label></th>
            <th><label class="table-sort" data-sort="sort-type">Tag</label></th>
            <th><label class="table-sort" data-sort="sort-score">Status</label></th>
            <th><label class="table-sort" data-sort="sort-date">Created</label></th>
            <th><label class="table-sort" data-sort="sort-quantity">Size</label></th>
            <th><label class="table-sort" data-sort="sort-progress">Action</label></th>
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
                <td><input class="form-check-input m-0 align-middle" name="select" value="${images[i].Id}" type="checkbox" aria-label="Select"></td>
                <td class="sort-name">${images[i].RepoTags}</td>
                <td class="sort-city">${images[i].Id}</td>
                <td class="sort-type"> - </td>
                <td class="sort-score text-green"> - </td>
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
        avatar: req.session.user.charAt(0).toUpperCase(),
        image_list: image_list,
        image_count: images.length,
        alert: '',
    });

}