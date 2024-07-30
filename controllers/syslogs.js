import { ServerSettings } from '../database/config.js';
import { Alert, getLanguage, Navbar } from '../utils/system.js';

export const Syslogs = async function(req,res){


    res.render("syslogs",{ 
        alert: '',
        username: req.session.username,
        role: req.session.role,
        navbar: await Navbar(req),
    });
}



export const submitSyslogs = async function(req,res){

    // console.log(req.body);

    let trigger_name = req.header('hx-trigger-name');
    let trigger_id = req.header('hx-trigger');

    console.log(`trigger_name: ${trigger_name} - trigger_id: ${trigger_id}`);


    res.render("syslogs",{
        alert: '',
        username: req.session.username,
        role: req.session.role,
        navbar: await Navbar(req),
    });

}