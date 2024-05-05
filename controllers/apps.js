import { readFileSync, readdirSync, renameSync, mkdirSync, unlinkSync } from 'fs';
import multer from 'multer';

const upload = multer({storage: multer.diskStorage({
  destination: function (req, file, cb) { cb(null, 'templates/tmp/') },
  filename: function (req, file, cb) { cb(null, file.originalname) },
})});


// load the default template then sort the templates by name
let templatesJSON = readFileSync('./templates/templates.json');

let templates = JSON.parse(templatesJSON).templates;

templates = templates.sort((a, b) => {
    if (a.name < b.name) { return -1; }
});

let alert = '';



export const Apps = (req, res) => {
  
  let page = Number(req.params.page) || 1;
  let custom_template = req.params.template;

  if (custom_template) {
    console.log(custom_template);
  }

  let list_start = (page-1)*28;
  let list_end = (page*28);
  let last_page = Math.ceil(templates.length/28);
  let prev = '/apps/' + (page-1);
  let next = '/apps/' + (page+1);
  if (page == 1) { prev = '/apps/' + (page); }
  if (page == last_page) { next = '/apps/' + (page); }

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
      // loop through the categories and add the badge to the card
      for (let j = 0; j < templates[i].categories.length; j++) {
        categories += CatagoryColor(templates[i].categories[j]);
      }
      appCard = appCard.replace(/AppName/g, name);
      appCard = appCard.replace(/AppShortName/g, name);
      appCard = appCard.replace(/AppDesc/g, desc);
      appCard = appCard.replace(/AppLogo/g, logo);
      appCard = appCard.replace(/AppCategories/g, categories);
      apps_list += appCard;
  }
  // let templatesJSON = readFileSync('./templates/templates.json');
  // let templates = JSON.parse(templatesJSON).templates;

  res.render("apps", {
    name: req.session.user,
    role: req.session.role,
    avatar: req.session.user.charAt(0).toUpperCase(),
    list_start: list_start + 1,
    list_end: list_end,
    app_count: templates.length,
    prev: prev,
    next: next,
    apps_list: apps_list,
    alert: alert,
    template_list: '',
  });
  alert = '';
}




export const appSearch = async (req, res) => {
  let page = Number(req.params.page) || 1;
  let list_start = (page-1)*28;
  let list_end = (page*28);
  let last_page = Math.ceil(templates.length/28);
  let prev = '/apps/' + (page-1);
  let next = '/apps/' + (page+1);
  if (page == 1) { prev = '/apps/' + (page); }
  if (page == last_page) { next = '/apps/' + (page); }

  let search = req.body.search;

  let apps_list = '';
  let results = [];
  let [cat_1, cat_2, cat_3] = ['','',''];

  function searchTemplates(terms) {
    terms = terms.toLowerCase();
    for (let i = 0; i < templates.length; i++) {
      if (templates[i].categories) {
        if (templates[i].categories[0]) {
          cat_1 = (templates[i].categories[0]).toLowerCase();
        }
        if (templates[i].categories[1]) {
          cat_2 = (templates[i].categories[1]).toLowerCase();
        }
        if (templates[i].categories[2]) {
          cat_3 = (templates[i].categories[2]).toLowerCase();
        }
      }
      if ((templates[i].description.includes(terms)) || (templates[i].name.includes(terms)) || (templates[i].title.includes(terms)) || (cat_1.includes(terms)) || (cat_2.includes(terms)) || (cat_3.includes(terms))){
          results.push(templates[i]);
      }
    }
  }
  searchTemplates(search);

  for (let i = 0; i < results.length; i++) {
    let appCard = readFileSync('./views/partials/appCard.html', 'utf8');
    let name = results[i].name || results[i].title.toLowerCase();
    let desc = results[i].description.slice(0, 60) + "...";
    let description = results[i].description.replaceAll(". ", ".\n") || "no description available";
    let note = results[i].note ? results[i].note.replaceAll(". ", ".\n") : "no notes available";
    let image = results[i].image;
    let logo = results[i].logo;let categories = '';
    // set data.catagories to 'other' if data.catagories is empty or undefined
    if (results[i].categories == null || results[i].categories == undefined || results[i].categories == '') {
      results[i].categories = ['Other'];
    }
    // loop through the categories and add the badge to the card
    for (let j = 0; j < results[i].categories.length; j++) {
      categories += CatagoryColor(results[i].categories[j]);
    }
    appCard = appCard.replace(/AppName/g, name);
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
      app_count: results.length,
      prev: prev,
      next: next,
      apps_list: apps_list,
      alert: alert,
      template_list: '',
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

export const InstallModal = async (req, res) => {
  let input = req.header('hx-trigger-name');
  let result = templates.find(t => t.name == input);

  let name = result.name || result.title.toLowerCase();
  let short_name = name.slice(0, 25) + "...";
  let desc = result.description.replaceAll(". ", ".\n") || "no description available";
  let short_desc = desc.slice(0, 60) + "...";
  let modal_name = name.replaceAll(" ", "-");
  let form_id = name.replaceAll("-", "_");
  let note = result.note ? result.note.replaceAll(". ", ".\n") : "no notes available";
  let command = result.command ? result.command : "";
  let command_check = command ? "checked" : "";
  let privileged = result.privileged || "";
  let privileged_check = privileged ? "checked" : "";
  let repository = result.repository || "";
  let image = result.image || "";
  let net_host, net_bridge, net_docker = '';
  let net_name = 'AppBridge';
  let restart_policy = result.restart_policy || 'unless-stopped';
  
  switch (result.network) {
    case 'host':
      net_host = 'checked';
      break;
    case 'bridge':
      net_bridge = 'checked';
      net_name = result.network;
      break;
    default:
      net_docker = 'checked';
  }

  if (repository != "") {
    image = (`${repository.url}/raw/master/${repository.stackfile}`);
  }

  let [ports_data, volumes_data, env_data, label_data] = [[], [], [], []];

  for (let i = 0; i < 12; i++) {
    
    // Get port details
    try {
      let ports = result.ports[i];
      let port_check = ports ? "checked" : "";
      let port_external = ports.split(":")[0] ? ports.split(":")[0] : ports.split("/")[0];
      let port_internal = ports.split(":")[1] ? ports.split(":")[1].split("/")[0] : ports.split("/")[0];
      let port_protocol = ports.split("/")[1] ? ports.split("/")[1] : "";

      // remove /tcp or /udp from port_external if it exists
      if (port_external.includes("/")) {
        port_external = port_external.split("/")[0];
      }
      
      ports_data.push({
        check: port_check,
        external: port_external,
        internal: port_internal,
        protocol: port_protocol
      });
    } catch {
        ports_data.push({
          check: "",
          external: "",
          internal: "",
          protocol: ""
        });
    }

    // Get volume details
    try {
      let volumes = result.volumes[i];
      let volume_check = volumes ? "checked" : "";
      let volume_bind = volumes.bind ? volumes.bind : "";
      let volume_container = volumes.container ? volumes.container.split(":")[0] : "";
      let volume_readwrite = "rw";

      if (volumes.readonly == true) {
        volume_readwrite = "ro";
      }

      volumes_data.push({
        check: volume_check,
        bind: volume_bind,
        container: volume_container,
        readwrite: volume_readwrite
      });
    } catch {
      volumes_data.push({
        check: "",
        bind: "",
        container: "",
        readwrite: ""
      });
    }

    // Get environment details
    try {
      let env = result.env[i];
      let env_check = "";
      let env_default = env.default ? env.default : "";
      if (env.set) { env_default = env.set;}
      let env_description = env.description ? env.description : "";
      let env_label = env.label ? env.label : "";
      let env_name = env.name ? env.name : "";

      env_data.push({
        check: env_check,
        default: env_default,
        description: env_description,
        label: env_label,
        name: env_name
      });
    } catch {
      env_data.push({
        check: "",
        default: "",
        description: "",
        label: "",
        name: ""
      });
    }

    // Get label details
    try {
      let label = result.labels[i];
      let label_check = "";
      let label_name = label.name ? label.name : "";
      let label_value = label.value ? label.value : "";

      label_data.push({
        check: label_check,
        name: label_name,
        value: label_value
      });
    } catch {
      label_data.push({
        check: "",
        name: "",
        value: ""
      });
    }

  }
  
  let modal = readFileSync('./views/modals/install.html', 'utf8');
  modal = modal.replace(/AppName/g, name);
  modal = modal.replace(/AppNote/g, note);
  modal = modal.replace(/AppImage/g, image);
  modal = modal.replace(/RestartPolicy/g, restart_policy);
  modal = modal.replace(/NetHost/g, net_host);
  modal = modal.replace(/NetBridge/g, net_bridge);
  modal = modal.replace(/NetDocker/g, net_docker);
  modal = modal.replace(/NetName/g, net_name);
  modal = modal.replace(/ModalName/g, modal_name);
  modal = modal.replace(/FormId/g, form_id);
  modal = modal.replace(/CommandCheck/g, command_check);
  modal = modal.replace(/CommandValue/g, command);
  modal = modal.replace(/PrivilegedCheck/g, privileged_check);


  for (let i = 0; i < 12; i++) {
    modal = modal.replaceAll(`Port${i}Check`, ports_data[i].check);
    modal = modal.replaceAll(`Port${i}External`, ports_data[i].external);
    modal = modal.replaceAll(`Port${i}Internal`, ports_data[i].internal);
    modal = modal.replaceAll(`Port${i}Protocol`, ports_data[i].protocol);

    modal = modal.replaceAll(`Volume${i}Check`, volumes_data[i].check);
    modal = modal.replaceAll(`Volume${i}Bind`, volumes_data[i].bind);
    modal = modal.replaceAll(`Volume${i}Container`, volumes_data[i].container);
    modal = modal.replaceAll(`Volume${i}RW`, volumes_data[i].readwrite);
    
    modal = modal.replaceAll(`Env${i}Check`, env_data[i].check);
    modal = modal.replaceAll(`Env${i}Default`, env_data[i].default);
    modal = modal.replaceAll(`Env${i}Description`, env_data[i].description);
    modal = modal.replaceAll(`Env${i}Label`, env_data[i].label);
    modal = modal.replaceAll(`Env${i}Name`, env_data[i].name);

    modal = modal.replaceAll(`Label${i}Check`, label_data[i].check);
    modal = modal.replaceAll(`Label${i}Name`, label_data[i].name);
    modal = modal.replaceAll(`Label${i}Value`, label_data[i].value);
  }
  res.send(modal);
}


export const LearnMore = async (req, res) => {
  let name = req.header('hx-trigger-name');
  let id = req.header('hx-trigger');

  let modal = readFileSync('./views/modals/learnmore.html', 'utf8');
  res.send(modal);
}


export const ImportModal = async (req, res) => {
  let modal = readFileSync('./views/modals/import.html', 'utf8');
  res.send(modal);
}


export const Upload = (req, res) => {
  upload.array('files', 10)(req, res, () => {

    alert = `<div class="alert alert-success alert-dismissible mb-0 py-2" role="alert">
              <div class="d-flex">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M5 12l5 5l10 -10"></path></svg>
                </div>
                <div>
                  Template(s) Uploaded!
                </div>
              </div>
              <a class="btn-close" data-bs-dismiss="alert" aria-label="close" style="padding-top: 0.5rem;"></a>
            </div>`;
    
    let files = readdirSync('templates/tmp/');

    for (let i = 0; i < files.length; i++) {
      if (files[i].endsWith('.json')) {
        renameSync(`templates/tmp/${files[i]}`, `templates/json/${files[i]}`);
      } else if (files[i].endsWith('.yml') || files[i].endsWith('.yaml')) {
        mkdirSync(`templates/compose/${files[i].slice(0, -4)}`);
        renameSync(`templates/tmp/${files[i]}`, `templates/compose/${files[i].slice(0, -4)}/${files[i]}`);
      } else {
        unlinkSync(`templates/tmp/${files[i]}`);
      }
    }
        
    res.redirect('/apps');
  });
};