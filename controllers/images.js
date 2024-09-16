import { Alert, getLanguage, Navbar, Footer } from '../utils/system.js';
import { imageList, GetContainerLists } from '../utils/docker.js';

export const Images = async function(req,res){

    let container_images = [];
    let image_list = '';
    
    let containers = await GetContainerLists();
    for (let i = 0; i < containers.length; i++) {
        container_images.push(containers[i].Image);
    }

    let images = await imageList();

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

    res.render("images",{ 
        alert: '',
        username: req.session.username,
        role: req.session.role,
        image_count: '',
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


export const submitImages = async function(req,res){

    // console.log(req.body);

    let trigger_name = req.header('hx-trigger-name');
    let trigger_id = req.header('hx-trigger');

    console.log(`trigger_name: ${trigger_name} - trigger_id: ${trigger_id}`);


    res.render("images",{
        alert: '',
        username: req.session.username,
        role: req.session.role,
        navbar: await Navbar(req),
        footer: await Footer(req),
    });

}