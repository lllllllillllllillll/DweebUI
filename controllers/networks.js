import { Alert, getLanguage, Navbar } from '../utils/system.js';

export const Networks = async function(req,res){


    res.render("networks",{ 
        alert: '',
        username: req.session.username,
        role: req.session.role,
        network_count: '',
        network_list: '',
        navbar: await Navbar(req),
    });
}



export const submitNetworks = async function(req,res){

    // console.log(req.body);

    let trigger_name = req.header('hx-trigger-name');
    let trigger_id = req.header('hx-trigger');

    console.log(`trigger_name: ${trigger_name} - trigger_id: ${trigger_id}`);



    res.render("networks",{
        alert: '',
        username: req.session.username,
        role: req.session.role,
        network_count: '',
        network_list: '',
        navbar: await Navbar(req),
    });

}