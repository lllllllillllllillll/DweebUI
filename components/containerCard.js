// export for app.js
export const containerCard = (data) => {
  
  let { name, service, state, external_port, internal_port, ports, link } = data;
  let wrapped = name;
  let chart = name;

  if (name.length > 13) {
    wrapped = name.slice(0, 10) + '...';
  }

  //disable controls for a docker container depending on its name
  let actions = "";
  if (name.startsWith('dweebui')) {
    actions = 'disabled=""';
  }

  if ( external_port == undefined ) { external_port = 0; }
  if ( internal_port == undefined ) { internal_port = 0; }


  let state_indicator = 'green';
  if (state == 'exited') {
    state = 'stopped';
    state_indicator = 'red';
  } else if (state == 'paused') {
    state_indicator = 'orange';
  }

  let ports_data = [];
  if (ports) {
    ports_data = ports;
  } else {
    for (let i = 0; i < 12; i++) {

      let port_check = "checked";
      let external = i;
      let internal = i;
      let protocol = "tcp";

      ports_data.push({
        check: port_check,
        external: external,
        internal: internal,
        protocol: protocol
      });
    }
  }


  return `
    <div class="col-sm-6 col-lg-3 deleteme">
      <div class="card">
        <div class="card-body">
          <div class="card-stamp card-stamp-sm">
            <img width="100px" src="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI-Icons/main/${service}.png" onerror="this.onerror=null;this.src='https://raw.githubusercontent.com/lllllllillllllillll/DweebUI-Icons/main/docker.png';"></img>
          </div>
          <div class="d-flex align-items-center">
            <div class="subheader text-yellow">${external_port}:${internal_port}</div>
            <div class="ms-auto lh-1">
              <div class="card-actions btn-actions">
                <div class="card-actions btn-actions">
                  <button onclick="clicked(this)" name="${name}" value="${state}" id="start" class="btn-action" title="Start" ${actions}><!-- player-play -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon-tabler icon-tabler-player-play" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M7 4v16l13 -8z"></path></svg>
                  </button>
                  <button onclick="clicked(this)" name="${name}" value="${state}" id="stop" class="btn-action" title="Stop" ${actions}><!-- player-stop -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon-tabler icon-tabler-player-stop" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M5 5m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z"></path></svg>
                  </button>
                  <button onclick="clicked(this)" name="${name}" value="${state}" id="pause" class="btn-action" title="Pause" ${actions}><!-- player-pause -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon-tabler icon-tabler-player-pause" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M6 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z"></path><path d="M14 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z"></path></svg>
                  </button>
                  <button onclick="clicked(this)" name="${name}" value="${state}" id="restart" class="btn-action" title="Restart" ${actions}><!-- reload -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon-tabler icon-tabler-reload" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M19.933 13.041a8 8 0 1 1 -9.925 -8.788c3.899 -1 7.935 1.007 9.425 4.747"></path><path d="M20 4v5h-5"></path></svg>                          
                  </button>
                  <div class="dropdown">
                    <a href="#" class="btn-action dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      <svg xmlns="http://www.w3.org/2000/svg" class="" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="19" r="1"></circle><circle cx="12" cy="5" r="1"></circle></svg>
                    </a>
                    <div class="dropdown-menu dropdown-menu-end">
                      <button class="dropdown-item text-secondary" onclick="clicked(this)" id="details" data-bs-toggle="modal" data-bs-target="#details_modal" href="#">Details</button>
                      <button class="dropdown-item text-secondary" onclick="clicked(this)" name="${name}" id="logs" data-bs-toggle="modal" data-bs-target="#log_view" href="#">Logs</button>
                      <button class="dropdown-item text-secondary" onclick="clicked(this)" name="${name}" id="edit" href="#">Edit</button>
                      <button class="dropdown-item text-primary" onclick="clicked(this)" name="${name}" id="update" href="#">Update</button>
                      <button class="dropdown-item text-danger" onclick="clicked(this)" name="${name}" id="remove" data-bs-toggle="modal" data-bs-target="#remove_modal" href="#">Remove</button>
                    </div>
                  </div>
                  <div class="dropdown">
                    <a href="#" class="btn-action dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      <svg xmlns="http://www.w3.org/2000/svg" class="icon-tabler icon-tabler-eye" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"> <path stroke="none" d="M0 0h24v24H0z" fill="none"/> <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /> <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /> </svg>
                    </a>
                    <div class="dropdown-menu dropdown-menu-end">
                      <button class="dropdown-item" onclick="clicked(this)" name="${name}" id="hide" value="hide">Hide</button>
                      <button class="dropdown-item" onclick="clicked(this)" name="${name}" id="resetView" value="resetView">Reset View</button>
                      <button class="dropdown-item" onclick="clicked(this)" name="${name}" id="permissions" value="permissions">Permissions</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="d-flex align-items-baseline">
            <div class="h1 me-2" title="${name}" style="margin-bottom: 0;">
              <a href="http://${link}:${external_port}" target="_blank">
                ${wrapped}
              </a>
            </div>
            <div class="ms-auto">
              <span class="text-${state_indicator} align-items-center lh-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon-tabler icon-tabler-point-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"> <path stroke="none" d="M0 0h24v24H0z" fill="none"></path> <path d="M12 7a5 5 0 1 1 -4.995 5.217l-.005 -.217l.005 -.217a5 5 0 0 1 4.995 -4.783z" stroke-width="0" fill="currentColor"></path></svg>
                ${state}
              </span>
            </div>
          </div>
          <div id="${chart}_chart" class="chart-sm"></div>
        </div>
      </div>
    </div>
    <div class="modal modal-blur fade" id="remove_modal" tabindex="-1" style="display: none;" aria-hidden="true">
      <div class="modal-dialog modal-sm modal-dialog-centered" role="document">
        <div class="modal-content">
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          <div class="modal-status bg-danger"></div>
          <div class="modal-body text-center py-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon mb-2 text-danger icon-lg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M12 9v2m0 4v.01"></path><path d="M5 19h14a2 2 0 0 0 1.84 -2.75l-7.1 -12.25a2 2 0 0 0 -3.5 0l-7.1 12.25a2 2 0 0 0 1.75 2.75"></path></svg>
            <h3>Remove ${name}?</h3>
            <form action="/uninstall" id="${name}_uninstall" method="POST">
            <input type="text" class="form-control" name="service_name" value="${name}" hidden/>
            <div class="mb-3"> </div>
            
            <div class="mb-2">
              <div class="divide-y">
                <div class="row">
                  <div class="col-9">
                    <label class="row text-start">
                      <span class="col">Remove Volumes</span>
                    </label>
                  </div>
                  <div class="col-3">
                    <label class="form-check form-check-single form-switch text-end">
                      <input class="form-check-input" type="checkbox" name="remove_volumes" disabled="">
                    </label>
                  </div>
                </div>
                <div class="row">
                  <div class="col-9">
                    <label class="row text-start">
                      <span class="col">
                        Remove Image
                      </span>
                    </label>
                  </div>
                  <div class="col-3">
                    <label class="form-check form-check-single form-switch text-end">
                      <input class="form-check-input" type="checkbox" name="remove_image" disabled="">
                    </label>
                  </div>
                </div>
                <div class="row">
                  <div class="col-9">
                    <label class="row text-start">
                      <span class="col">
                        Remove Backups
                      </span>
                    </label>
                  </div>
                  <div class="col-3">
                    <label class="form-check form-check-single form-switch text-end">
                      <input class="form-check-input" type="checkbox" name="remove_backups" disabled="">
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-1"> </div>
            <div class="text-muted">Enter "Yes" below to remove the container.</div>
            <input type="text" class="form-control mb-2" name="confirm" autocomplete="off">
            </form>
          </div>
          <div class="modal-footer">
            <div class="w-100">
              <div class="row">
                <div class="col">
                  <a href="#" class="btn w-100" data-bs-dismiss="modal">
                    Cancel
                  </a>
                </div>
                <div class="col">
                  <input type="submit" form="${name}_uninstall" class="btn btn-danger w-100" value="Uninstall"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}