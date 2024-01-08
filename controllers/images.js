import { docker } from '../app.js';

export const Images = async function(req, res) {

    const allImages = await docker.listImages({ all: true });

    for (let i = 0; i < allImages.length; i++) {
        console.log(`Image ${i}:`)
        console.log(`repoTags: ${allImages[i].repoTags}`)
    }
    
    res.render("images", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.avatar,
    });

}