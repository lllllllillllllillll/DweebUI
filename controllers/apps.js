import { Alert, getLanguage, Navbar, Footer } from '../utils/system.js';
import { readFileSync, readdirSync, renameSync, mkdirSync, unlinkSync, existsSync } from 'fs';
import { parse } from 'yaml';
import multer from 'multer';
import AdmZip from 'adm-zip';

let templates_global = '';
let json_templates = '';
let remove_button = '';



const upload = multer({storage: multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'appdata/tmp/') },
    filename: function (req, file, cb) { cb(null, file.originalname) },
})});



export const searchApps = async function (req, res) {
  console.log(`[Search] ${req.body.search}`);
  res.send('ok');
  return;
}


export const Apps = async function(req,res){

  let [apps_list, app_count] = ['', ''];
  let page = Number(req.params.page) || 1;
  let template = req.params.template || 'default';


    // Pagination
    let list_start = (page - 1) * 40 + 1;
    let list_end = (page * 40);
    let last_page = '';

    let pages =`<li class="page-item"><a class="page-link" href="/apps/1/${template}">1</a></li>
                <li class="page-item"><a class="page-link" href="/apps/2/${template}">2</a></li>
                <li class="page-item"><a class="page-link" href="/apps/3/${template}">3</a></li>
                <li class="page-item"><a class="page-link" href="/apps/4/${template}">4</a></li>
                <li class="page-item"><a class="page-link" href="/apps/5/${template}">5</a></li>`

    let prev = '/apps/' + (page - 1) + '/' + template;
    let next = '/apps/' + (page + 1) + '/' + template;
    if (page == 1) { prev = '/apps/' + (page) + '/' + template; }
    if (page == last_page) { next = '/apps/' + (page) + '/' + template;}
              
    // Add a remove button if it's not the default template or a compose template
    if ((template != 'default') && (template != 'compose')) {
        remove_button = `<a href="/remove_template/${template}" class="btn" hx-confirm="Are you sure you want to remove this template?">Remove</a>`;
    } else {
        remove_button = '';
    }
    
    // Check for other templates and add them to the dropdown list
    json_templates = '';
    let json_files = readdirSync('appdata/templates/').filter(file => file.endsWith('.json'));
    for (let i = 0; i < json_files.length; i++) {
      if (json_files[i] != 'default.json') {
        let filename = json_files[i].split('.')[0];
        let link = `<li><a class="dropdown-item" href="/apps/1/${filename}">${filename}</a></li>`
        json_templates += link;
      }
    }

    // Display compose files if the template is set to 'compose'
    if (template == 'compose') {
      let compose_files = readdirSync('appdata/compose/');
      
      app_count = compose_files.length;
      last_page = Math.ceil(compose_files.length/40);
  
      compose_files.forEach(file => {
        if (file == '.gitignore') { return; }
  
        let compose = readFileSync(`appdata/compose/${file}/compose.yaml`, 'utf8');
        let compose_data = parse(compose);
        let service_name = Object.keys(compose_data.services)
        let container = compose_data.services[service_name].container_name;
        let image = compose_data.services[service_name].image;
  
        // let appCard = readFileSync('./views/partials/appCard.html', 'utf8');
        let appCard = readFileSync('views/partials/app_card.html', 'utf8');
        appCard = appCard.replace(/AppName/g, service_name);
        appCard = appCard.replace(/AppDescription/g, 'Compose File');
        appCard = appCard.replace(/AppIcon/g, `https://raw.githubusercontent.com/lllllllillllllillll/DweebUI-Icons/main/${service_name}.png`);
        // appCard = appCard.replace(/AppCategories/g, '<span class="badge bg-orange-lt">Compose</span> ');
        appCard = appCard.replace(/AppType/g, 'compose');
        apps_list += appCard;
      });
    } else {

      let template_file = readFileSync(`appdata/templates/${template}.json`);
      let templates = JSON.parse(template_file).templates;
      templates = templates.sort((a, b) => { if (a.name < b.name) { return -1; } });
      app_count = templates.length; 

      templates_global = templates;

      apps_list = '';
      for (let i = list_start; i < list_end && i < templates_global.length; i++) {
          let appCard = readFileSync('views/partials/app_card.html', 'utf8');
          let name = templates[i].name || templates[i].title.toLowerCase();
          let title = templates[i].title || templates[i].name;
          // let desc = templates[i].description.slice(0, 75) + "...";
          let desc = templates[i].description || "no description available";

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
          appCard = appCard.replace(/AppTitle/g, title);
          appCard = appCard.replace(/AppShortName/g, name);
          appCard = appCard.replace(/AppDescription/g, desc);
          appCard = appCard.replace(/AppIcon/g, logo);
          appCard = appCard.replace(/AppCategories/g, categories);
          appCard = appCard.replace(/AppType/g, 'json');
          apps_list += appCard;
      }
    }


    app_count = `${list_start} - ${list_end} of ${templates_global.length} Apps`;

    res.render("apps",{ 
        alert: '',
        username: req.session.username,
        role: req.session.role,
        app_count: app_count,
        remove_button: '',
        json_templates: '',
        apps_list: apps_list,
        prev: prev,
        next: next,
        pages: pages,
        navbar: await Navbar(req),
        footer: await Footer(req),
    });
}



export const submitApps = async function (req, res) {

    let app_name = req.header('hx-trigger-name');
    let app_type = req.header('hx-trigger');
    let action = req.params.action;

    // console.log(`[submitApps] app_name: ${app_name} app_type: ${app_type} action: ${action}`);

    // Modal for compose files
    if (action == 'view_install' && app_type == 'compose') {
      let compose = readFileSync(`appdata/compose/${app_name}/compose.yaml`, 'utf8');
      let modal = readFileSync('views/partials/compose.html', 'utf8');
      modal = modal.replace(/AppName/g, app_name);
      modal = modal.replace(/COMPOSE_CONTENT/g, compose);
      res.send(modal);
      return;
    } 

    // Modal for json templates
    if (action == 'view_install' && app_type == 'json') {
      let result = templates_global.find(t => t.name == app_name);
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
  



      for (let i = 0; i < 20; i++) {
        
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
      
      let modal = readFileSync('views/partials/details.html', 'utf8');
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
  
  
      for (let i = 0; i < 20; i++) {
        modal = modal.replaceAll(`Port${i}Check`, ports_data[i].check);
        modal = modal.replaceAll(`Port${i}External`, ports_data[i].external);
        modal = modal.replaceAll(`Port${i}Internal`, ports_data[i].internal);
        modal = modal.replaceAll(`Port${i}Protocol`, ports_data[i].protocol);
  
        modal = modal.replaceAll(`Vol${i}Check`, volumes_data[i].check);
        modal = modal.replaceAll(`Vol${i}Source`, volumes_data[i].bind);
        modal = modal.replaceAll(`Vol${i}Destination`, volumes_data[i].container);
        modal = modal.replaceAll(`Vol${i}RW`, volumes_data[i].readwrite);
        
        modal = modal.replaceAll(`Env${i}Check`, env_data[i].check);
        modal = modal.replaceAll(`Env${i}Key`, env_data[i].name);
        modal = modal.replaceAll(`Env${i}Value`, env_data[i].default);

        modal = modal.replaceAll(`Env${i}Description`, env_data[i].description);
        modal = modal.replaceAll(`Env${i}Label`, env_data[i].label);
  
        modal = modal.replaceAll(`Label${i}Check`, label_data[i].check);
        modal = modal.replaceAll(`Label${i}Key`, label_data[i].name);
        modal = modal.replaceAll(`Label${i}Value`, label_data[i].value);
      }

    res.send(modal);
  }
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