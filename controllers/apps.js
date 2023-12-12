const User = require('../database/UserModel');
const { appCard } = require('../components/appCard')
const { dashCard } = require('../components/dashCard');

const { install, uninstall } = require('../functions/package_manager');

// import { install, uninstall } from '../functions/package_manager';

const templates_json = require('../templates.json');
let templates = templates_json.templates;

// sort templates alphabetically
templates = templates.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
  });
  

exports.Apps = async function(req, res) {

    console.log(req.params.page);


    if (req.session.role == "admin") {

        // Get the user.
        let user = await User.findOne({ where: { UUID: req.session.UUID }});

        let page = Number(req.query.page) || 1;
        let list_start = (page - 1) * 28;
        let list_end = (page * 28);
        let last_page = Math.ceil(templates.length / 28);

        let prev = '/apps?page=' + (page - 1);
        let next = '/apps?page=' + (page + 1);
        if (page == 1) {
            prev = '/apps?page=' + (page);
        }
        if (page == last_page) {
            next = '/apps?page=' + (page);
        }

        let apps_list = '';
        for (let i = list_start; i < list_end && i < templates.length; i++) {
            let app_card = appCard(templates[i]);

            apps_list += app_card;
        }
        
        // Render the home page
        res.render("pages/apps", {
            name: user.first_name + ' ' + user.last_name,
            role: user.role,
            avatar: user.avatar,
            isLoggedIn: true,
            list_start: list_start + 1,
            list_end: list_end,
            app_count: templates.length,
            prev: prev,
            next: next,
            apps_list: apps_list
        });
    } else {
        // Redirect to the login page
        res.redirect("/login");
    }
}



exports.searchApps = async function(req, res) {
    if (req.session.role == "admin") {

        // Get the user.
        let user = await User.findOne({ where: { UUID: req.session.UUID }});

        let page = Number(req.query.page) || 1;
        let list_start = (page - 1) * 28;
        let list_end = (page * 28);
        let last_page = Math.ceil(templates.length / 28);

        let prev = '/apps?page=' + (page - 1);
        let next = '/apps?page=' + (page + 1);
        if (page == 1) {
            prev = '/apps?page=' + (page);
        }
        if (page == last_page) {
            next = '/apps?page=' + (page);
        }

        let apps_list = '';
        let search_results = [];

        let search = req.body.search;

        // split value of search into an array of words
        search = search.split(' ');
        try {console.log(search[0]);} catch (error) {}
        try {console.log(search[1]);} catch (error) {}
        try {console.log(search[2]);} catch (error) {}

        function searchTemplates(word) {

            for (let i = 0; i < templates.length; i++) {
                if ((templates[i].description.includes(word)) || (templates[i].name.includes(word)) || (templates[i].title.includes(word))) {
                    search_results.push(templates[i]);
                }
            }
            // console.log(search_results);
        }
        
        searchTemplates(search);

        for (let i = 0; i < search_results.length; i++) {
            let app_card = appCard(search_results[i]);
            apps_list += app_card;
        }
        
        // Render the home page
        res.render("pages/apps", {
            name: user.first_name + ' ' + user.last_name,
            role: user.role,
            avatar: user.avatar,
            isLoggedIn: true,
            list_start: list_start + 1,
            list_end: list_end,
            app_count: templates.length,
            prev: prev,
            next: next,
            apps_list: apps_list
        });
    } else {
        // Redirect to the login page
        res.redirect("/login");
    }
}









exports.Install = async function (req, res) {
    
    if (req.session.role == "admin") {

        console.log(`Starting install for: ${req.body.name}`)

        install(req.body);

        let container_info = {
            name: req.body.name,
            service: req.body.service_name,
            state: 'installing',
            image: req.body.image,
            restart_policy: req.body.restart_policy
        }

        let installCard = dashCard(container_info);

        req.app.locals.install = installCard;

        
        // Redirect to the home page
        res.redirect("/");
    } else {
        // Redirect to the login page
        res.redirect("/login");
    }
}



exports.Uninstall = async function (req, res) {
    
    if (req.session.role == "admin") {


        if (req.body.confirm == 'Yes') {

            uninstall(req.body);

        }


        // Redirect to the home page
        res.redirect("/");
    } else {
        // Redirect to the login page
        res.redirect("/login");
    }
}