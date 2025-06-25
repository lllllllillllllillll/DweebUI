import { Alert, Navbar, Footer } from '../sys/utils.js';
import { imageList, GetContainerLists, removeImage, imagePull } from '../sys/docker.js';

export const Images = async function(req,res){

    // Get a list of running containers then push the image names to container_images
    let container_images = [];

    let containers = await GetContainerLists(req.session.host);
    for (let i = 0; i < containers.length; i++) {
        container_images.push(containers[i].Image);
    }

    // Get a list of images
    let image_list = '';
    let images = await imageList(req.session.host);

    // Create an entry for each image
    for (let i = 0; i < images.length; i++) {
        let [ full_image_name, image_name, tag ] = ['', '', ''];

        try { full_image_name = images[i].RepoTags[0]; } catch {}
        try { image_name = images[i].RepoTags[0].split(':')[0]; } catch {}
        try { tag = images[i].RepoTags[0].split(':')[1]; } catch {}

        let image_id = images[i].Id.split(':')[1];

        let date = new Date(images[i].Created * 1000);
        let created = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        let size = images[i].Size / 1000 / 1000; // to match docker desktop
        size = size.toFixed(2);

        let status = '';
        try {
            if (container_images.includes(full_image_name)) {
                status = 'In use';
            }
            else if (container_images.includes(image_name)) {
                // console.log(`Modified match found for ${image_name}`);
                status = 'In use';
            }
            else {
                // console.log(`Not found in list: ${full_image_name}`);
            }
        } catch {}

        let details = `
            <tr>
                <td><input class="form-check-input m-0 align-middle" name="select" value="${images[i].Id}" type="checkbox" aria-label="Select"></td>
                <td class="sort-name">${image_name}</td>
                <td class="sort-type">${tag}</td>
                <td class="sort-city">${image_id}</td>
                <td class="sort-score text-green">${status}</td>
                <td class="sort-quantity">${size} MB</td>
                <td class="sort-date" data-date="1628122643">${created}</td>
                <td class=""><button class="badge badge-outline text-grey" id="" data-hx-get="/users/usersModals/user/" hx-target="#modal_content"  hx-swap="innerHTML" data-bs-toggle="modal" data-bs-target="#scrolling_modal">Details</button></td>
            </tr>`
        image_list += details;
    }

    res.render("images",{ 
        alert: '',
        username: req.session.username,
        role: req.session.role,
        image_count: images.length,
        image_list: image_list,
        navbar: await Navbar(req),
        footer: await Footer(req),
    });
}

export const searchImages = async function (req, res) {
    console.log(`[Search] ${req.body.search}`);
    res.send('ok');
    return;
}


export const ImagesView = async function(req,res){
    // something
}

export const ImagesAction = async function(req,res){

    let action = req.params.action;
    let id = req.params.id;
    let host = req.session.host || 1;

    // Pull
    if (action == 'pull') {
        try {
            await imagePull(req.body.image, req.body.tag, host);
        } 
        catch {
            console.log(`Unable to pull image: ${req.body.image}`);
        }
        req.session.alert = Alert('success', `Image pulled successfully.`);
        res.redirect('/images');
        return;
    }


    // Grab the list of images
    let images = req.body.select;

    console.log(`Action: ${action} - ID: ${id}`);
    
    // Make sure the value is an array
    if (typeof(images) == 'string') { images = [images]; }
    
    // Loop through the array
    for (let i = 0; i < images.length; i++) {

        // Ignore the selectAll checkbox
        if (images[i] == 'on') { continue; }

        // Remove
        if (action == 'remove') {
            try {
                await removeImage(images[i], req.session.host);
            } 
            catch {
                console.log(`Unable to remove image: ${images[i]}`);
            }
        }
    }

    req.session.alert = Alert('success', `Images removed successfully.`);
    res.redirect('/images');
}