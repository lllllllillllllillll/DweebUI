import { readFileSync } from 'fs';
import { appCard } from '../components/appCard.js';

let templatesJSON = readFileSync('./templates.json');
let templates = JSON.parse(templatesJSON).templates;

templates = templates.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
});

export const Apps = (req, res) => {
    // console.log(req.body);
    
    let page = Number(req.params.page) || 1;
    let list_start = (page-1)*28;
    let list_end = (page*28);
    let last_page = Math.ceil(templates.length/28);

    let prev = '/apps/' + (page-1);
    let next = '/apps/' + (page+1);
    if (page == 1) {
        prev = '/apps/' + (page);
    }
    if (page == last_page) {
        next = '/apps/' + (page);
    }

    let apps_list = '';
    for (let i = list_start; i < list_end && i < templates.length; i++) {
        let app_card = appCard(templates[i]);

        apps_list += app_card;
    }
    
    res.render("apps", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.avatar,
        list_start: list_start + 1,
        list_end: list_end,
        app_count: templates.length,
        prev: prev,
        next: next,
        apps_list: apps_list
    });

}



export const searchApps = async (req, res) => {

    // console.log(req.body);
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

    console.log(req.body);
    let search = req.body.search;

    // split value of search into an array of words
    search = search.split(' ');
    // try {console.log(search[0]);} catch (error) {}
    // try {console.log(search[1]);} catch (error) {}
    // try {console.log(search[2]);} catch (error) {}

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
    
    res.render("apps", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.avatar,
        list_start: list_start + 1,
        list_end: list_end,
        app_count: templates.length,
        prev: prev,
        next: next,
        apps_list: apps_list
    });

}