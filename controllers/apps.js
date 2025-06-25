import { Alert, Navbar, Footer, Capitalize } from '../sys/utils.js';
import { readFileSync, readdirSync, renameSync, mkdirSync, unlinkSync, existsSync } from 'fs';
import { parse } from 'yaml';
import multer from 'multer';
import AdmZip from 'adm-zip';




export const Apps = async function(req,res){
  
    // Set 'page' and 'template' to defaults if they are undefined
    if (req.session.page == undefined) { req.session.page = 1; }
    if (req.session.template == undefined) { req.session.template = 'default'; }

    let [apps_list, app_count, remove_button, json_templates] = ['', 0, '', ''];
    let page = req.session.page * 1;
    let template = req.session.template;

    // Adds a remove button if it's not the default template or a compose template
    if ((template != 'default') && (template != 'compose')) {
        remove_button = `
          <form action="/apps/action/remove/${template}" method="POST" class="d-inline">
            <button type="submit" class="btn" onclick="return confirm('Are you sure you want to remove this template?')">Remove</button>
          </form>`;
    } else { remove_button = ''; }
    
	// Create the template folders if they don't exist
	if (!existsSync('data/templates')) {
		mkdirSync('data/templates/json', { recursive: true });
		mkdirSync('data/templates/compose');
		mkdirSync('data/tmp');
	}

    // Create the dropdown entries for json templates
    let json_files = readdirSync('data/templates/json');
    for (let i = 0; i < json_files.length; i++) {
		let filename = json_files[i].split('.')[0];
		let link = `<li><a class="dropdown-item" href="/apps/view/template/${filename}">${Capitalize(filename)}</a></li>`
		json_templates += link;
    }

    // Pagination - 40 apps per page
    let list_start = (page - 1) * 40 + 1;
    let list_end = (page * 40);
    let last_page = '';

    let pages =`<li class="page-item">
                  <a class="page-link" href="/apps/view/page/${page - 1}" tabindex="-1" aria-disabled="true">
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 6l-6 6l6 6" /></svg>
                    prev
                  </a>
                </li>
                <li class="page-item"><a class="page-link" href="/apps/view/page/1/">1</a></li>
                <li class="page-item"><a class="page-link" href="/apps/view/page/2/">2</a></li>
                <li class="page-item"><a class="page-link" href="/apps/view/page/3/">3</a></li>
                <li class="page-item"><a class="page-link" href="/apps/view/page/4/">4</a></li>
                <li class="page-item"><a class="page-link" href="/apps/view/page/5/">5</a></li>
                <li class="page-item">
                  <a class="page-link" href="/apps/view/page/${page + 1}">
                    next
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 6l6 6l-6 6" /></svg>
                  </a>
                </li>`;

    // if (page == 0 || 1) { prev = '/apps/view/page/' + (page) + '/'; }
    // if (page == last_page) { next = '/apps/view/page/' + (page) + '/';}


    // Viewing default templates
    if (template == 'default') {
		let templates = JSON.parse(readFileSync('sys/apps.json', 'utf8'));
		templates = templates.templates;
		app_count = templates.length;
		// Sort the templates by name
		templates = templates.sort((a, b) => { if (a.name < b.name) { return -1; } });
		apps_list = '';
		for (let i = list_start; i <= list_end && i < app_count; i++) {
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
			// Set data.categories to 'other' if data.categories is empty or undefined
			if (templates[i].categories == null || templates[i].categories == undefined || templates[i].categories == '') { templates[i].categories = ['Other']; }
			// Loop through the categories and add the badge to the card
			for (let j = 0; j < templates[i].categories.length; j++) { categories += CategoryColor(templates[i].categories[j]); }
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


	// Viewing compose files
	else if (template == 'compose') {
		let compose_files = readdirSync('data/templates/compose/');
		app_count = compose_files.length;
		last_page = Math.ceil(compose_files.length/40);
		compose_files.forEach(file => {
			let compose = parse(readFileSync(`data/templates/compose/${file}/compose.yaml`, 'utf8'));
			let service_name = Object.keys(compose.services);
			let container = compose.services[service_name].container_name;
			let image = compose.services[service_name].image;
			let appCard = readFileSync('views/partials/app_card.html', 'utf8');
			appCard = appCard.replace(/AppTitle/g, service_name);
			appCard = appCard.replace(/AppName/g, service_name);
			appCard = appCard.replace(/AppDescription/g, 'Compose File');
			appCard = appCard.replace(/AppIcon/g, `https://raw.githubusercontent.com/lllllllillllllillll/DweebUI-Icons/main/${service_name}.png`);
			appCard = appCard.replace(/AppCategories/g, '<span class="badge bg-orange-lt">Compose</span> ');
			appCard = appCard.replace(/AppType/g, 'compose');
			apps_list += appCard;
		});
	} 
    

    // Viewing a custom template
    else {
		let templates = JSON.parse(readFileSync(`data/templates/json/${template}.json`));
		templates = templates.templates;
		app_count = templates.length;
		templates = templates.sort((a, b) => { if (a.name < b.name) { return -1; } });
		apps_list = '';
		for (let i = list_start; i <= list_end && i < app_count; i++) {
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
			// Set data.categories to 'other' if undefined or empty
			if (templates[i].categories == null || templates[i].categories == undefined || templates[i].categories == '') { templates[i].categories = ['Other']; }
			// Loop through the categories and add the badge to the card
			for (let j = 0; j < templates[i].categories.length; j++) { categories += CategoryColor(templates[i].categories[j]); }
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


    res.render("apps",{ 
		username: req.session.username,
		role: req.session.role,
		app_count: `${list_start} - ${list_end} of ${app_count} Apps`,
		remove_button: remove_button,
		selected_template: template == 'default' ? 'Default Templates' : template == 'compose' ? 'Compose Files' : Capitalize(template),
		json_templates: json_templates,
		apps_list: apps_list,
		pages: pages,
		navbar: await Navbar(req),
		footer: await Footer(req),
    });
}






export const AppsView = async function (req, res) {
  
	let app_name = req.header('hx-trigger-name');
	let app_type = req.header('hx-trigger');
	let view = req.params.view;
	let id = req.params.id;
	let template = req.session.template;

	// console.log(`[submitApps] app_name: ${app_name} app_type: ${app_type} view: ${view}`);

	// Change the page then redirect.
	if (view == 'page') { req.session.page = id; res.redirect('/apps'); return; }

	// Change the template then redirect.
	if (view == 'template') { req.session.template = id; res.redirect('/apps'); return; }

	// Modal for compose files
	if (view == 'install' && app_type == 'compose') {
		let compose = readFileSync(`data/templates/compose/${app_name}/compose.yaml`, 'utf8');
		let modal = readFileSync('views/partials/compose.html', 'utf8');
		modal = modal.replace(/AppName/g, app_name);
		modal = modal.replace(/COMPOSE_CONTENT/g, compose);
		res.send(modal);
		return;
	} 

	// More info modal
	if (view == 'info' && app_type == 'json') {
		let modal = readFileSync('views/partials/info.html', 'utf8');
		let app_title = Capitalize(app_name);

		let templates = ``;
		if (template == 'default') {	
			templates = JSON.parse(readFileSync(`sys/apps.json`));
		} else {
			templates = JSON.parse(readFileSync(`data/templates/json/${req.session.template}.json`));
		}
		templates = templates.templates;

		let result = templates.find(t => t.name == app_name);
		modal = modal.replace(/AppTitle/g, app_title);
		modal = modal.replace(/AppDescription/g, result.description);
		res.send(modal);
		return;
	}

	// Install modal for json templates
	if (view == 'install' && app_type == 'json') {

		let templates = '';
		if (template == 'default') {	
			templates = JSON.parse(readFileSync(`sys/apps.json`));
		} else {
			templates = JSON.parse(readFileSync(`data/templates/json/${req.session.template}.json`));
		}
		templates = templates.templates;

		let result = templates.find(t => t.name == app_name);

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
		
		if (result.network == 'host') { net_host = 'checked'; }
		else if (result.network == 'bridge') { net_bridge = 'checked'; net_name = result.network; }
		else { net_docker = 'checked'; }

		if (repository != "") {
			image = (`${repository.url}/raw/master/${repository.stackfile}`);
		}
		
		// Ports
		let ports_list = '';
		for (let i = 0; i < result.ports.length; i++) {
		let external, internal, protocol = '';
		let port = result.ports[i];
		// value of 'port' can be '8000:8000/tcp' or '8000/tcp'
		if (port.includes(":")) {
			external = port.split(":")[0];
			internal = port.split(":")[1].split("/")[0];
			protocol = port.split(":")[1].split("/")[1];
		} else {
			external = port.split("/")[0];
			internal = port.split("/")[0];
			protocol = port.split("/")[1];
		}
		ports_list += `<div class="row mb-1 align-items-end">
							<div class="col-auto">
							<input class="form-check-input" name="port${i}" type="checkbox" checked>
							</div>
							<div class="col">
							<input type="text" class="form-control" name="external${i}" value="${external}"/>
							</div>
							<div class="col">
								<input type="text" class="form-control" name="internal${i}" value="${internal}"/>
							</div>
							<div class="col-lg-2">
							<select class="form-select" name="protocol${i}">
								<option value="${protocol}" selected hidden>${protocol}</option>
								<option value="tcp">tcp</option>
								<option value="udp">udp</option>
							</select>
							</div>
						</div>`;
		}

		let volumes_list = '';
		if (result.volumes) {
		for (let i = 0; i < result.volumes.length; i++) {
			let volume = result.volumes[i];
			let readonly = volume.readonly ? 'ro' : 'rw';
			volumes_list += `<div class="row mb-1 align-items-end">
								<div class="col-auto">
									<input class="form-check-input" name="volume${i}" type="checkbox" checked>
								</div>
								<div class="col">
									<input type="text" class="form-control" name="bind${i}" value="${volume.bind}"/>
								</div>
								<div class="col">
									<input type="text" class="form-control" name="container${i}" value="${volume.container}"/>
								</div>
								<div class="col-lg-2">
								<select class="form-select" name="readwrite${i}">
									<option value="${readonly}" selected hidden>${readonly}</option>
									<option value="rw">rw</option>
									<option value="ro">ro</option>
								</select>
								</div>
							</div>`;
		}
		}

		let env_list = '';
		if (result.env) {
		for (let i = 0; i < result.env.length; i++) {
			let env = result.env[i];
			let value = '';
			if (env.set) { value = env.set; }
			else if (env.default) { value = env.default; }

			env_list += `<div class="row mb-1 align-items-end">
						<div class="col-auto">
							<input class="form-check-input" type="checkbox" name="env${i}" checked>
							</div>
							<div class="col">
							<input type="text" class="form-control" name="env_name${i}" value="${env.name}" title="${env.description}"/>
							</div>
							<div class="col">
							<input type="text" class="form-control" name="env_default${i}" value="${value}"/>
							</div>
							</div>`
		}
		}

		let labels = '';
		if (result.labels) {
		for (let i = 0; i < result.labels.length; i++) {
			let label = result.labels[i];
			labels += `<div class="row mb-1 align-items-end">
						<div class="col-auto">
							<input class="form-check-input" type="checkbox" name="label${i}" checked>
						</div>
						<div class="col">
							<input type="text" class="form-control" name="label_name${i}" value="${label.name}"/>
						</div>
						<div class="col">
						<input type="text" class="form-control" name="label_value${i}" value="${label.value}"/>
						</div>
					</div>`
		}
		}
		
		let modal = readFileSync('views/partials/install.html', 'utf8');
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
		modal = modal.replace(/PortsList/g, ports_list);
		modal = modal.replace(/EnvList/g, env_list);
		modal = modal.replace(/VolumesList/g, volumes_list);
		modal = modal.replace(/LabelsList/g, labels);

		res.send(modal);
		return;
	}
}



export const AppsAction = async function (req, res) {
    let action = req.params.action;
    let id = req.params.id;

    // console.log(`[AppsAction] action: ${action} id: ${id}`);

    // Template upload
    if (action == 'upload') {

		const upload = multer({storage: multer.diskStorage({
			destination: function (req, file, cb) { cb(null, 'data/tmp/') },
			filename: function (req, file, cb) { cb(null, file.originalname) },
		})});

      	upload.array('files', 10)(req, res, () => {

			let files = readdirSync('data/tmp/');
    
			for (let i = 0; i < files.length; i++) {

				// Zip file
				if (files[i].endsWith('.zip')) {
					let zip = new AdmZip(`data/tmp/${files[i]}`);
					// Extract zip file to tmp
					zip.extractAllTo('data/tmp', true);
					// Get the extracted folders
					let extracted = readdirSync(`data/tmp/`);
					// Ignore any zip files in the extracted folders
					extracted = extracted.filter(folder => !folder.endsWith('.zip'));
					// Move the folders into /data/templates/compose
					for (let j = 0; j < extracted.length; j++) {
						mkdirSync(`data/templates/compose/${extracted[j]}`);
						renameSync(`data/tmp/${extracted[j]}/compose.yaml`, `data/templates/compose/${extracted[j]}/compose.yaml`);
					}
					// Remove the zip file
					unlinkSync(`data/tmp/${files[i]}`);
					req.session.alert = Alert('success', 'Zip file uploaded successfully!');
				}    

				// JSON file
				else if (files[i].endsWith('.json')) {
					if (existsSync(`data/templates/json/${files[i]}`)) {
						unlinkSync(`data/tmp/${files[i]}`);
						res.redirect('/apps');
						return;
					}
					renameSync(`data/tmp/${files[i]}`, `data/templates/json/${files[i]}`);
				} 

				// Compose file
				else if ((files[i].endsWith('.yml')) || (files[i].endsWith('.yaml'))) {
					let compose = readFileSync(`data/tmp/${files[i]}`, 'utf8');
					let compose_data = parse(compose);
					let service_name = Object.keys(compose_data.services);
					if (existsSync(`data/compose/${service_name}`)) {
						unlinkSync(`data/tmp/${files[i]}`);
						res.redirect('/apps');
						return;
					}
					mkdirSync(`data/compose/${service_name}`);
					renameSync(`data/tmp/${files[i]}`, `data/templates/compose/${service_name}/compose.yaml`);
				} 
				
				else {
					// unsupported file type
					console.log('Removing unsupported file type from tmp folder: ' + files[i]);
					unlinkSync(`data/tmp/${files[i]}`);
				}
			}   
        res.redirect('/apps');
      });
      return;
    }

    // Remove template
    if (action == 'remove') {
		unlinkSync(`data/templates/json/${id}.json`);
		req.session.template = 'default';
		res.redirect('/apps');
		return;
    }


    // Search
    if (action == 'search') {
		console.log(`[Search] ${req.body.search}`);
		res.redirect('/apps');
		return;
    }


}




export const searchApps = async function (req, res) {
	console.log(`[Search] ${req.body.search}`);
	res.send('ok');
	return;
}



function CategoryColor(category) {
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