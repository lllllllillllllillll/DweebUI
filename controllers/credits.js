import { Navbar, Sidebar, Footer } from '../sys/utils.js';

export const Credits = async function (req, res) {

    res.render("credits",{ 
        alert: '',
        navbar: await Navbar(req),
        sidebar: await Sidebar(req),
        footer: await Footer(req)
    });
}


export const searchCredits = async function (req, res) {
    console.log(`[Search] ${req.body.search}`);
    res.send('ok');
    return;
}