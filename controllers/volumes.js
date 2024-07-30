import { Alert, getLanguage, Navbar } from '../utils/system.js';

export const Volumes = async function(req,res){


    res.render("volumes",{ 
        alert: '',
        username: req.session.username,
        role: req.session.role,
        volume_count: '',
        volume_list: '',
        navbar: await Navbar(req),
    });
}



export const submitVolumes = async function(req,res){

    // console.log(req.body);

    let trigger_name = req.header('hx-trigger-name');
    let trigger_id = req.header('hx-trigger');

    console.log(`trigger_name: ${trigger_name} - trigger_id: ${trigger_id}`);


    res.render("volumes",{
        alert: '',
        username: req.session.username,
        role: req.session.role,
        volume_count: '',
        volume_list: '',
        navbar: await Navbar(req),
    });

}