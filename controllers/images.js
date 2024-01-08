import { docker } from '../app.js';
import { dockerImages } from 'systeminformation';

export const Images = async function(req, res) {

    const data1 = await dockerImages({ all: true });

    const data2 = await docker.listImages({ all: true });

    // for ( i = 0; i < data.length; i++) {
    //     console.log(`Image ${i}:`)
    //     console.log(`repoTags: ${data[i].repoTags}`)
    // }
    
    console.log(`data1: ${data1}`);

    console.log(`data2: ${data2}`);


    // for (let i = 0; i < allImages.length; i++) {
    //     console.log(`Image ${i}:`)
    //     console.log(`repoTags: ${allImages[i].repoTags}`)
    // }
    
    res.render("images", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.avatar,
    });

}