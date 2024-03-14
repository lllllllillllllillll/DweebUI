import { readFileSync } from 'fs';

let templatesJSON = readFileSync('./templates/templates.json');
let templates = JSON.parse(templatesJSON).templates;

templates = templates.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
});



export const Apps = (req, res) => {
    
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
        let appCard = readFileSync('./views/partials/appCard.html', 'utf8');
        let name = templates[i].name || templates[i].title.toLowerCase();
        let desc = templates[i].description.slice(0, 60) + "...";
        let description = templates[i].description.replaceAll(". ", ".\n") || "no description available";
        let note = templates[i].note ? templates[i].note.replaceAll(". ", ".\n") : "no notes available";
        let image = templates[i].image;
        let logo = templates[i].logo;

        let categories = '';

          // set data.catagories to 'other' if data.catagories is empty or undefined
        if (templates[i].categories == null || templates[i].categories == undefined || templates[i].categories == '') {
            templates[i].categories = ['Other'];
        }

        for (let c = 0; c < templates[i].categories.length; c++) {
          categories += CatagoryColor(templates[i].categories[c]);
        }

        appCard = appCard.replace(/AppShortName/g, name);
        appCard = appCard.replace(/AppDesc/g, desc);
        appCard = appCard.replace(/AppLogo/g, logo);
        appCard = appCard.replace(/AppCategories/g, categories);

        apps_list += appCard;
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



export const appSearch = async (req, res) => {

    let search = req.body.search.split(' ');
    let apps_list = '';
    let results = [];

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

    function searchTemplates(word) {
        for (let i = 0; i < templates.length; i++) {
            if ((templates[i].description.includes(word)) || (templates[i].name.includes(word)) || (templates[i].title.includes(word))) {
                results.push(templates[i]);
            }
        }
    }
    searchTemplates(search);

    for (let i = 0; i < results.length; i++) {
        let app_card = appCard(results[i]);
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


function CatagoryColor(category) {
    switch (category) {
      case 'Other':
        return '<span class="badge bg-blue-lt">Other</span> ';
      case 'Productivity':
        return '<span class="badge bg-blue-lt">Productivity</span> ';
      case 'Tools':
        return '<span class="badge bg-blue-lt">Tools</span> ';
      case 'Dashboard':
        return '<span class="badge bg-blue-lt">Dashboard</span> ';
      case 'Communication':
        return '<span class="badge bg-azure-lt">Communication</span> ';
      case 'Media':
        return '<span class="badge bg-azure-lt">Media</span> ';
      case 'CMS':
        return '<span class="badge bg-azure-lt">CMS</span> ';
      case 'Monitoring':
        return '<span class="badge bg-indigo-lt">Monitoring</span> ';
      case 'LDAP':
        return '<span class="badge bg-purple-lt">LDAP</span> ';
      case 'Arr':
        return '<span class="badge bg-purple-lt">Arr</span> ';
      case 'Database':
        return '<span class="badge bg-red-lt">Database</span> ';
      case 'Paid':
        return '<span class="badge bg-red-lt" title="This is a paid product or contains paid features.">Paid</span> ';
      case 'Gaming':
        return '<span class="badge bg-pink-lt">Gaming</span> ';
      case 'Finance':
        return '<span class="badge bg-orange-lt">Finance</span> ';
      case 'Networking':
        return '<span class="badge bg-yellow-lt">Networking</span> ';
      case 'Authentication':
        return '<span class="badge bg-lime-lt">Authentication</span> ';
      case 'Development':
        return '<span class="badge bg-green-lt">Development</span> ';
      case 'Media Server':
        return '<span class="badge bg-teal-lt">Media Server</span> ';
      case 'Downloaders':
        return '<span class="badge bg-cyan-lt">Downloaders</span> ';
      default:
        return ''; // default to other if the category is not recognized
    }
  }