module.exports.dashCard = function dashCard(data) {
  
  let { name, service, id, state, image, external_port, internal_port, ports, volumes, environment_variables, labels } = data;
  
  //disable controls for a docker container depending on its name
  let enabled = "";
  if (name.startsWith('Dweeb')) {
    enabled = 'disabled=""';
  }

  if ( external_port == undefined ) { external_port = 0; }
  if ( internal_port == undefined ) { internal_port = 0; }


  let shortened_name = name;
  if (name.length > 13) {
    shortened_name = name.slice(0, 10) + '...';
  }

  let state_indicator = 'green';
  if (state == 'exited') {
    state = 'stopped';
    state_indicator = 'red';
  } else if (state == 'paused') {
    state_indicator = 'orange';
  }


  let app_name = name
  let modal = app_name.replaceAll(" ", "-");
  let form_id = app_name.replaceAll("-", "_");

  let restart_policy = 'unless-stopped';
  
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

  let volumes_data = [];
  if (volumes) {
    volumes_data = volumes;
  } else {
    for (let i = 0; i < 12; i++) {

      let vol_check = "checked";
      let bind = i;
      let container = i;
      let readwrite = "rw";

      volumes_data.push({
        check: vol_check,
        bind: bind,
        container: container,
        readwrite: readwrite
      });
    }
  }


  let env_data = [];
  if (environment_variables) {
    env_data = environment_variables;
  } else {
    for (let i = 0; i < 12; i++) {

      let env_check = "checked";
      let env_name = i;
      let env_default = i;

      env_data.push({
        check: env_check,
        name: env_name,
        default: env_default
      });
    }
  }


  let label_data = [];
  if (labels) {
    label_data = labels;
  } else {
    for (let i = 0; i < 12; i++) {

      let label_check = "checked";
      let label_name = i;
      let label_default = i;
      
      label_data.push({
        check: label_check,
        name: label_name,
        value: label_default
      });
    }
  }

  return `
    <div class="col-sm-6 col-lg-3 deleteme">
      <div class="card">
        <div class="card-body">
          <div class="card-stamp card-stamp-sm">
            <img heigh="150px" width="150px" src="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI-Icons/main/${service}.png" onerror="this.onerror=null;this.src='https://raw.githubusercontent.com/lllllllillllllillll/DweebUI-Icons/main/dweebui.png';"></img>
          </div>
          <div class="d-flex align-items-center">
            <div class="subheader text-yellow">${external_port}:${internal_port}</div>
            <div class="ms-auto lh-1">
              <div class="card-actions btn-actions">
                <div class="card-actions btn-actions">
                  <button onclick="buttonAction(this)" name="${name}" value="start" id="${state}" class="btn-action" title="Start" ${enabled}><!-- player-play -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon-tabler icon-tabler-player-play" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M7 4v16l13 -8z"></path></svg>
                  </button>
                  <button onclick="buttonAction(this)" name="${name}" value="stop" id="${state}" class="btn-action" title="Stop" ${enabled}><!-- player-stop -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon-tabler icon-tabler-player-stop" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M5 5m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z"></path></svg>
                  </button>
                  <button onclick="buttonAction(this)" name="${name}" value="pause" id="${state}" class="btn-action" title="Pause" ${enabled}><!-- player-pause -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon-tabler icon-tabler-player-pause" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M6 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z"></path><path d="M14 5m0 1a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1z"></path></svg>
                  </button>
                  <button onclick="buttonAction(this)" name="${name}" value="restart" id="${state}" class="btn-action" title="Restart" ${enabled}><!-- reload -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="icon-tabler icon-tabler-reload" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M19.933 13.041a8 8 0 1 1 -9.925 -8.788c3.899 -1 7.935 1.007 9.425 4.747"></path><path d="M20 4v5h-5"></path></svg>                          
                  </button>
                  <div class="dropdown">
                    <a href="#" class="btn-action dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><!-- Download SVG icon from http://tabler-icons.io/i/dots-vertical -->
                      <svg xmlns="http://www.w3.org/2000/svg" class="" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="19" r="1"></circle><circle cx="12" cy="5" r="1"></circle></svg>
                    </a>
                    <div class="dropdown-menu dropdown-menu-end">
                      <a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#${name}_modal-details" href="#">Details</a>
                      <a class="dropdown-item" onclick="viewLogs(this)" name="${name}" data-bs-toggle="modal" data-bs-target="#log_view" href="#">Logs</a>
                      <a class="dropdown-item" href="#">Edit</a>
                      <a class="dropdown-item text-primary" href="#">Update</a>
                      <a class="dropdown-item text-danger" data-bs-toggle="modal" data-bs-target="#${name}_modal-danger" href="#">Remove</a>
                    </div>
                  </div>
                  <div class="dropdown">
                    <a href="#" class="btn-action dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><!-- Download SVG icon from http://tabler-icons.io/i/dots-vertical -->
                      <svg xmlns="http://www.w3.org/2000/svg" class="icon-tabler icon-tabler-eye" width="44" height="44" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round"> <path stroke="none" d="M0 0h24v24H0z" fill="none"/> <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /> <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /> </svg>
                    </a>
                    <div class="dropdown-menu dropdown-menu-end">
                      <a class="dropdown-item" href="#">Hide</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="d-flex align-items-baseline">
            <div class="h1 me-2" title="${name}">
              <a href="http://localhost:${external_port}" target="_blank">
                ${shortened_name}
              </a>
            </div>
            <div class="ms-auto">
              <span class="text-${state_indicator} align-items-center lh-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon-tabler icon-tabler-point-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"> <path stroke="none" d="M0 0h24v24H0z" fill="none"></path> <path d="M12 7a5 5 0 1 1 -4.995 5.217l-.005 -.217l.005 -.217a5 5 0 0 1 4.995 -4.783z" stroke-width="0" fill="currentColor"></path></svg>
                ${state} <!-- Download SVG icon from http://tabler-icons.io/i/minus -->
              </span>
            </div>
          </div>
          <div id="${name}_chart" class="chart-sm"></div>
        </div>
      </div>
    </div>
    




    


    <div class="modal modal-blur fade deleteme" id="${name}_modal-danger" tabindex="-1" style="display: none;" aria-hidden="true">
      <div class="modal-dialog modal-sm modal-dialog-centered" role="document">
        <div class="modal-content">
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          <div class="modal-status bg-danger"></div>
          <div class="modal-body text-center py-3">
            <!-- Download SVG icon from http://tabler-icons.io/i/alert-triangle -->
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
                      <input class="form-check-input" type="checkbox" checked="" name="remove_volumes">
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
                      <input class="form-check-input" type="checkbox" checked="" name="remove_image">
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
                      <input class="form-check-input" type="checkbox" checked="" name="remove_backups">
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
    </div>
    

    
    <div class="modal modal-blur fade" id="${name}_modal-details" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title">Install ${name}</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
            
                    
                    <div class="modal-body">
                      
                    <pre class="text-secondary">note</pre>
                    
                      <form action="" id="details_modal" method="POST">
                      
                      <div class="row mb-3 align-items-end">
                        
                        <div class="col-lg-6">
                          <label class="form-label">Container Name: </label>
                          <input type="text" class="form-control" name="service_name" value="${app_name}" hidden/>
                          <input type="text" class="form-control" name="name" value="${app_name}"/>
                        </div>
                        <div class="col-lg-3">
                          <label class="form-label">Image: </label>
                          <input type="text" class="form-control" name="image" value="${image}"/>
                        </div>
                        <div class="col-lg-3">
                          <label class="form-label">Restart Policy: </label>
                          <select class="form-select" name="restart_policy" value="${restart_policy}">
                            <option value="1">unless-stopped</option>
                            <option value="2">on-failure</option>
                            <option value="3">never</option>
                            <option value="4">always</option>
                          </select>
                        </div>
                      </div>
            
                      <label class="form-label">Network Mode</label>
                        <div class="form-selectgroup-boxes row mb-3">
                          <div class="col">
                            <label class="form-selectgroup-item">
                              <input type="radio" name="report-type" value="1" class="form-selectgroup-input">
                              <span class="form-selectgroup-label d-flex align-items-center p-3">
                                <span class="me-3">
                                  <span class="form-selectgroup-check"></span>
                                </span>
                                <span class="form-selectgroup-label-content">
                                  <span class="form-selectgroup-title strong mb-1">Host Network</span>
                                  <span class="d-block text-secondary">Same as host. No isolation. ex.127.0.0.1</span>
                                </span>
                              </span>
                            </label>
                          </div>
                          <div class="col">
                            <label class="form-selectgroup-item">
                              <input type="radio" name="report-type" class="form-selectgroup-input">
                              <span class="form-selectgroup-label d-flex align-items-center p-3">
                                <span class="me-3">
                                  <span class="form-selectgroup-check"></span>
                                </span>
                                <span class="form-selectgroup-label-content">
                                  <span class="form-selectgroup-title strong mb-1">Bridge Network</span>
                                  <span class="d-block text-secondary">Containers can communicate using names.</span>
                                </span>
                              </span>
                            </label>
                          </div>
                          <div class="col">
                          <label class="form-selectgroup-item">
                            <input type="radio" name="report-type" class="form-selectgroup-input">
                            <span class="form-selectgroup-label d-flex align-items-center p-3">
                              <span class="me-3">
                                <span class="form-selectgroup-check"></span>
                              </span>
                              <span class="form-selectgroup-label-content">
                                <span class="form-selectgroup-title strong mb-1">Docker Network</span>
                                <span class="d-block text-secondary">Isolated on the docker network. ex.172.0.34.2</span>
                              </span>
                            </span>
                          </label>
                        </div>
                      </div>




            
                      <div class="accordion" id="${modal}-accordion">
                        <div class="accordion-item">
                          <h2 class="accordion-header" id="heading-1">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-1" aria-expanded="false">
                              Ports
                            </button>
                          </h2>
                          <div id="collapse-1" class="accordion-collapse collapse" data-bs-parent="#${modal}-accordion">
                            <div class="accordion-body pt-0">
            

                              <div class="row mb-1 align-items-end">
                                <div class="col-auto">
                                  <input class="form-check-input" name="port_0_check" type="checkbox" ${ports_data[0].check}>
                                </div>
                                <div class="col">
                                  <label class="form-label">External Port</label>
                                  <input type="text" class="form-control" name="port_0_external" value="${ports_data[0].external}"/>
                                </div>
                                <div class="col">
                                  <label class="form-label">Internal Port</label>
                                  <input type="text" class="form-control" name="port_0_internal" value="${ports_data[0].internal}"/>
                                </div>
                                <div class="col-lg-2">
                                  <label class="form-label">Protocol</label>
                                  <select class="form-select" name="port_0_protocol">
                                    <option value="${ports_data[0].protocol}" selected hidden>${ports_data[0].protocol}</option>
                                    <option value="tcp">tcp</option>
                                    <option value="udp">udp</option>
                                  </select>
                                </div>
                              </div>
            
                              <div class="row mb-1 align-items-end">
                                <div class="col-auto">
                                  <input class="form-check-input" name="port_1_check" type="checkbox" ${ports_data[1].check}>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="port_1_external" value="${ports_data[1].external}"/>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="port_1_internal" value="${ports_data[1].internal}"/>
                                </div>
                                <div class="col-lg-2">
                                  <select class="form-select" name="port_1_protocol">
                                    <option value="${ports_data[1].protocol}" selected hidden>${ports_data[1].protocol}</option>
                                    <option value="tcp">tcp</option>
                                    <option value="udp">udp</option>
                                  </select>
                                </div>
                              </div>
            
                              <div class="row mb-1 align-items-end">
                                <div class="col-auto">
                                  <input class="form-check-input" name="port_2_check" type="checkbox" ${ports_data[2].check}>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="port_2_external" value="${ports_data[2].external}"/>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="port_2_internal" value="${ports_data[2].internal}"/>
                                </div>
                                <div class="col-lg-2">
                                  <select class="form-select" name="port_2_protocol">
                                    <option value="${ports_data[2].protocol}" selected hidden>${ports_data[2].protocol}</option>
                                    <option value="tcp">tcp</option>
                                    <option value="udp">udp</option>
                                  </select>
                                </div>
                              </div>
            
                              <div class="row mb-1 align-items-end">
                                <div class="col-auto">
                                  <input class="form-check-input" name="port_3_check" type="checkbox" ${ports_data[3].check}>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="port_3_external" value="${ports_data[3].external}"/>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="port_3_internal" value="${ports_data[3].internal}"/>
                                </div>
                                <div class="col-lg-2">
                                  <select class="form-select" name="port_3_protocol">
                                    <option value="${ports_data[3].protocol}" selected hidden>${ports_data[3].protocol}</option>
                                    <option value="tcp">tcp</option>
                                    <option value="udp">udp</option>
                                  </select>
                                </div>
                              </div>
            
                              <div class="row mb-1 align-items-end">
                                <div class="col-auto">
                                  <input class="form-check-input" name="port_4_check" type="checkbox" ${ports_data[4].check}>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="port_4_external" value="${ports_data[4].external}"/>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="port_4_internal" value="${ports_data[4].internal}"/>
                                </div>
                                <div class="col-lg-2">
                                  <select class="form-select" name="port_4_protocol">
                                    <option value="${ports_data[4].protocol}" selected hidden>${ports_data[4].protocol}</option>
                                    <option value="tcp">tcp</option>
                                    <option value="udp">udp</option>
                                  </select>
                                </div>
                              </div>
            
                              <div class="row mb-1 align-items-end">
                                <div class="col-auto">
                                  <input class="form-check-input" name="port_5_check" type="checkbox" ${ports_data[5].check}>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="port_5_external" value="${ports_data[5].external}"/>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="port_5_internal" value="${ports_data[5].internal}"/>
                                </div>
                                <div class="col-lg-2">
                                  <select class="form-select" name="port_5_protocol">
                                    <option value="${ports_data[5].protocol}" selected hidden>${ports_data[5].protocol}</option>
                                    <option value="tcp">tcp</option>
                                    <option value="udp">udp</option>
                                  </select>
                                </div>
                              </div>
            
            
                            </div>
                          </div>
                        </div>
                        <div class="accordion-item">
                          <h2 class="accordion-header" id="heading-2">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-2" aria-expanded="false">
                              Volumes
                            </button>
                          </h2>
                          <div id="collapse-2" class="accordion-collapse collapse" data-bs-parent="#${modal}-accordion">
                            <div class="accordion-body pt-0">
            
            
                            <div class="row mb-1 align-items-end">
                            <div class="col-auto">
                              <input class="form-check-input" name="volume_0_check" type="checkbox" ${volumes_data[0].check}>
                            </div>
                            <div class="col">
                              <input type="text" class="form-control" name="volume_0_bind" value="${volumes_data[0].bind}"/>
                            </div>
                            <div class="col">
                              <input type="text" class="form-control" name="volume_0_container" value="${volumes_data[0].container}"/>
                            </div>
                            <div class="col-lg-2">
                              <select class="form-select" name="volume_0_readwrite">
                                <option value="${volumes_data[0].readwrite}" selected hidden>${volumes_data[0].readwrite}</option>
                                <option value="rw">rw</option>
                                <option value="ro">ro</option>
                              </select>
                            </div>
                          </div>
            
                          <div class="row mb-1 align-items-end">
                            <div class="col-auto">
                              <input class="form-check-input" name="volume_1_check" type="checkbox" ${volumes_data[1].check}>
                            </div>
                            <div class="col">
                              <input type="text" class="form-control" name="volume_1_bind" value="${volumes_data[1].bind}"/>
                            </div>
                            <div class="col">
                              <input type="text" class="form-control" name="volume_1_container" value="${volumes_data[1].container}"/>
                            </div>
                            <div class="col-lg-2">
                              <select class="form-select" name="volume_1_readwrite">
                                <option value="${volumes_data[1].readwrite}" selected hidden>${volumes_data[1].readwrite}</option>
                                <option value="rw">rw</option>
                                <option value="ro">ro</option>
                              </select>
                            </div>
                          </div>
            
                          <div class="row mb-1 align-items-end">
                            <div class="col-auto">
                              <input class="form-check-input" name="volume_2_check" type="checkbox" ${volumes_data[2].check}>
                            </div>
                            <div class="col">
                              <input type="text" class="form-control" name="volume_2_bind" value="${volumes_data[2].bind}"/>
                            </div>
                            <div class="col">
                              <input type="text" class="form-control" name="volume_2_container" value="${volumes_data[2].container}"/>
                            </div>
                            <div class="col-lg-2">
                              <select class="form-select" name="volume_2_readwrite">
                                <option value="${volumes_data[2].readwrite}" selected hidden>${volumes_data[2].readwrite}</option>
                                <option value="rw">rw</option>
                                <option value="ro">ro</option>
                              </select>
                            </div>
                          </div>
            
                          <div class="row mb-1 align-items-end">
                            <div class="col-auto">
                              <input class="form-check-input" name="volume_3_check" type="checkbox" ${volumes_data[3].check}>
                            </div>
                            <div class="col">
                              <input type="text" class="form-control" name="volume_3_bind" value="${volumes_data[3].bind}"/>
                            </div>
                            <div class="col">
                              <input type="text" class="form-control" name="volume_3_container" value="${volumes_data[3].container}"/>
                            </div>
                            <div class="col-lg-2">
                              <select class="form-select" name="volume_3_readwrite">
                                <option value="${volumes_data[3].readwrite}" selected hidden>${volumes_data[3].readwrite}</option>
                                <option value="rw">rw</option>
                                <option value="ro">ro</option>
                              </select>
                            </div>
                          </div>
            
                          <div class="row mb-1 align-items-end">
                            <div class="col-auto">
                              <input class="form-check-input" name="volume_4_check" type="checkbox" ${volumes_data[4].check}>
                            </div>
                            <div class="col">
                              <input type="text" class="form-control" name="volume_4_bind" value="${volumes_data[4].bind}"/>
                            </div>
                            <div class="col">
                              <input type="text" class="form-control" name="volume_4_container" value="${volumes_data[4].container}"/>
                            </div>
                            <div class="col-lg-2">
                              <select class="form-select" name="volume_4_readwrite">
                                <option value="${volumes_data[4].readwrite}" selected hidden>${volumes_data[4].readwrite}</option>
                                <option value="rw">rw</option>
                                <option value="ro">ro</option>
                              </select>
                            </div>
                          </div>
            
                          <div class="row mb-1 align-items-end">
                          <div class="col-auto">
                            <input class="form-check-input" name="volume_5_check" type="checkbox" ${volumes_data[5].check}>
                          </div>
                          <div class="col">
                            <input type="text" class="form-control" name="volume_5_bind" value="${volumes_data[5].bind}"/>
                          </div>
                          <div class="col">
                            <input type="text" class="form-control" name="volume_5_container" value="${volumes_data[5].container}"/>
                          </div>
                          <div class="col-lg-2">
                            <select class="form-select" name="volume_5_readwrite">
                              <option value="${volumes_data[5].readwrite}" selected hidden>${volumes_data[5].readwrite}</option>
                              <option value="rw">rw</option>
                              <option value="ro">ro</option>
                            </select>
                          </div>
                        </div>
            
            
                            </div>
                          </div>
                        </div>
                        <div class="accordion-item">
                          <h2 class="accordion-header" id="heading-3">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-3" aria-expanded="false">
                              Environment Variables
                            </button>
                          </h2>
                          <div id="collapse-3" class="accordion-collapse collapse" data-bs-parent="#${modal}-accordion">
                            <div class="accordion-body pt-0">
            
            
                              <div class="row mb-1 align-items-end">
                                <div class="col-auto">
                                  <input class="form-check-input" type="checkbox" name="env_0_check" ${env_data[0].check}>
                                </div>
                                <div class="col">
                                  <label class="form-label">Variable</label>
                                  <input type="text" class="form-control" name="env_0_name" value="${env_data[0].name}"/>
                                </div>
                                <div class="col">
                                  <label class="form-label">Value</label>
                                  <input type="text" class="form-control" name="env_0_default" value="${env_data[0].default}"/>
                                </div>
                              </div>
            
                              <div class="row mb-1 align-items-end">
                                <div class="col-auto">
                                  <input class="form-check-input" type="checkbox" name="env_1_check" ${env_data[1].check}>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="env_1_name" value="${env_data[1].name}"/>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="env_1_default" value="${env_data[1].default}"/>
                                </div>
                              </div>
            
                              <div class="row mb-1 align-items-end">
                                <div class="col-auto">
                                  <input class="form-check-input" type="checkbox" name="env_2_check" ${env_data[2].check}>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="env_2_name" value="${env_data[2].name}"/>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="env_2_default" value="${env_data[2].default}"/>
                                </div>
                              </div>
            
                              <div class="row mb-1 align-items-end">
                                <div class="col-auto">
                                  <input class="form-check-input" type="checkbox" name="env_3_check" ${env_data[3].check}>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="env_3_name" value="${env_data[3].name}"/>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="env_3_default" value="${env_data[3].default}"/>
                                </div>
                              </div>
            
                              <div class="row mb-1 align-items-end">
                                <div class="col-auto">
                                  <input class="form-check-input" type="checkbox" name="env_4_check" ${env_data[4].check}>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="env_4_name" value="${env_data[4].name}"/>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="env_4_default" value="${env_data[4].default}"/>
                                </div>
                              </div>
            
                              <div class="row mb-1 align-items-end">
                                <div class="col-auto">
                                  <input class="form-check-input" type="checkbox" name="env_5_check" ${env_data[5].check}>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="env_5_name" value="${env_data[5].name}"/>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="env_5_default" value="${env_data[5].default}"/>
                                </div>
                              </div>
            
                              <div class="row mb-1 align-items-end">
                                <div class="col-auto">
                                  <input class="form-check-input" type="checkbox" name="env_6_check" ${env_data[6].check}>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="env_6_name" value="${env_data[6].name}"/>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="env_6_default" value="${env_data[6].default}"/>
                                </div>
                              </div>
            
            
                              <div class="row mb-1 align-items-end">
                                <div class="col-auto">
                                  <input class="form-check-input" type="checkbox" name="env_7_check" ${env_data[7].check}>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="env_7_name" value="${env_data[7].name}"/>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="env_7_default" value="${env_data[7].default}"/>
                                </div>
                              </div>
            
            
                              <div class="row mb-1 align-items-end">
                                <div class="col-auto">
                                  <input class="form-check-input" type="checkbox" name="env_8_check" ${env_data[8].check}>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="env_8_name" value="${env_data[8].name}"/>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="env_8_default" value="${env_data[8].default}"/>
                                </div>
                              </div>
            
            
                              <div class="row mb-1 align-items-end">
                                <div class="col-auto">
                                  <input class="form-check-input" type="checkbox" name="env_9_check" ${env_data[9].check}>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="env_9_name" value="${env_data[9].name}"/>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="env_9_default" value="${env_data[9].default}"/>
                                </div>
                              </div>
            
            
                              <div class="row mb-1 align-items-end">
                                <div class="col-auto">
                                  <input class="form-check-input" type="checkbox" name="env_10_check" ${env_data[10].check}>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="env_10_name" value="${env_data[10].name}"/>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="env_10_default" value="${env_data[10].default}"/>
                                </div>
                              </div>
            
            
                              <div class="row mb-1 align-items-end">
                                <div class="col-auto">
                                  <input class="form-check-input" type="checkbox" name="env_11_check" ${env_data[11].check}>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="env_11_name" value="${env_data[11].name}"/>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="env_11_default" value="${env_data[11].default}"/>
                                </div>
                              </div>
            
            
            
            
                            </div>
                          </div>
                        </div>
                        <div class="accordion-item">
                          <h2 class="accordion-header" id="heading-4">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-4" aria-expanded="false">
                              Labels
                            </button>
                          </h2>
                          <div id="collapse-4" class="accordion-collapse collapse" data-bs-parent="#${modal}-accordion">
                            <div class="accordion-body pt-0">
            
            
                            <div class="row mb-1 align-items-end">
                              <div class="col-auto">
                                <input class="form-check-input" type="checkbox" name="label_0_check" ${label_data[0].check}>
                              </div>
                              <div class="col">
                                <label class="form-label">Variable</label>
                                <input type="text" class="form-control" name="label_0_name" value="${label_data[0].name}"/>
                              </div>
                              <div class="col">
                                <label class="form-label">Value</label>
                                <input type="text" class="form-control" name="label_0_value" value="${label_data[0].value}"/>
                              </div>
                            </div>
            
                            <div class="row mb-1 align-items-end">
                              <div class="col-auto">
                                <input class="form-check-input" type="checkbox" name="label_1_check" ${label_data[1].check}>
                              </div>
                              <div class="col">
                                <input type="text" class="form-control" name="label_1_name" value="${label_data[1].name}"/>
                              </div>
                              <div class="col">
                                <input type="text" class="form-control" name="label_1_value" value="${label_data[1].value}"/>
                              </div>
                            </div>
            
                              
                            <div class="row mb-1 align-items-end">
                              <div class="col-auto">
                                <input class="form-check-input" type="checkbox" name="label_2_check" ${label_data[2].check}>
                              </div>
                              <div class="col">
                                <input type="text" class="form-control" name="label_2_name" value="${label_data[2].name}"/>
                              </div>
                              <div class="col">
                                <input type="text" class="form-control" name="label_2_value" value="${label_data[2].value}"/>
                              </div>
                            </div>
            
                            <div class="row mb-1 align-items-end">
                              <div class="col-auto">
                                <input class="form-check-input" type="checkbox" name="label_3_check" ${label_data[3].check}>
                              </div>
                              <div class="col">
                                <input type="text" class="form-control" name="label_3_name" value="${label_data[3].name}"/>
                              </div>
                              <div class="col">
                                <input type="text" class="form-control" name="label_3_value" value="${label_data[3].value}"/>
                              </div>
                            </div>
            
                            <div class="row mb-1 align-items-end">
                              <div class="col-auto">
                                <input class="form-check-input" type="checkbox" name="label_4_check" ${label_data[4].check}>
                              </div>
                              <div class="col">
                                <input type="text" class="form-control" name="label_4_name" value="${label_data[4].name}"/>
                              </div>
                              <div class="col">
                                <input type="text" class="form-control" name="label_4_value" value="${label_data[4].value}"/>
                              </div>
                            </div>

                            <div class="row mb-1 align-items-end">
                              <div class="col-auto">
                                <input class="form-check-input" type="checkbox" name="label_5_check" ${label_data[5].check}>
                              </div>
                              <div class="col">
                                <input type="text" class="form-control" name="label_5_name" value="${label_data[5].name}"/>
                              </div>
                              <div class="col">
                                <input type="text" class="form-control" name="label_5_value" value="${label_data[5].value}"/>
                              </div>
                            </div>

                            <div class="row mb-1 align-items-end">
                              <div class="col-auto">
                                <input class="form-check-input" type="checkbox" name="label_6_check" ${label_data[6].check}>
                              </div>
                              <div class="col">
                                <input type="text" class="form-control" name="label_6_name" value="${label_data[6].name}"/>
                              </div>
                              <div class="col">
                                <input type="text" class="form-control" name="label_6_value" value="${label_data[6].value}"/>
                              </div>
                            </div>

                            <div class="row mb-1 align-items-end">
                              <div class="col-auto">
                                <input class="form-check-input" type="checkbox" name="label_7_check" ${label_data[7].check}>
                              </div>
                              <div class="col">
                                <input type="text" class="form-control" name="label_7_name" value="${label_data[7].name}"/>
                              </div>
                              <div class="col">
                                <input type="text" class="form-control" name="label_7_value" value="${label_data[7].value}"/>
                              </div>
                            </div>

                            <div class="row mb-1 align-items-end">
                              <div class="col-auto">
                                <input class="form-check-input" type="checkbox" name="label_8_check" ${label_data[8].check}>
                              </div>
                              <div class="col">
                                <input type="text" class="form-control" name="label_8_name" value="${label_data[8].name}"/>
                              </div>
                              <div class="col">
                                <input type="text" class="form-control" name="label_8_value" value="${label_data[8].value}"/>
                              </div>
                            </div>

                            <div class="row mb-1 align-items-end">
                              <div class="col-auto">
                                <input class="form-check-input" type="checkbox" name="label_9_check" ${label_data[9].check}>
                              </div>
                              <div class="col">
                                <input type="text" class="form-control" name="label_9_name" value="${label_data[9].name}"/>
                              </div>
                              <div class="col">
                                <input type="text" class="form-control" name="label_9_value" value="${label_data[9].value}"/>
                              </div>
                            </div>

                            <div class="row mb-1 align-items-end">
                              <div class="col-auto">
                                <input class="form-check-input" type="checkbox" name="label_10_check" ${label_data[10].check}>
                              </div>
                              <div class="col">
                                <input type="text" class="form-control" name="label_10_name" value="${label_data[10].name}"/>
                              </div>
                              <div class="col">
                                <input type="text" class="form-control" name="label_10_value" value="${label_data[10].value}"/>
                              </div>
                            </div>

                            <div class="row mb-1 align-items-end">
                              <div class="col-auto">
                                <input class="form-check-input" type="checkbox" name="label_11_check" ${label_data[11].check}>
                              </div>
                              <div class="col">
                                <input type="text" class="form-control" name="label_11_name" value="${label_data[11].name}"/>
                              </div>
                              <div class="col">
                                <input type="text" class="form-control" name="label_11_value" value="${label_data[11].value}"/>
                              </div>
                            </div>
            
            
                            </div>
                          </div>
                        </div>


                        <div class="accordion-item">
                          <h2 class="accordion-header" id="heading-5">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-5" aria-expanded="false">
                              Extras
                            </button>
                          </h2>
                          <div id="collapse-5" class="accordion-collapse collapse" data-bs-parent="#${modal}-accordion">
                            <div class="accordion-body pt-0">
            

                              <div class="row mb-1 align-items-end">
                                <div class="col-auto">
                                  <input class="form-check-input" name="port_0_check" type="checkbox" ${ports_data[0].check}>
                                </div>
                                <div class="col">
                                  <label class="form-label">External Port</label>
                                  <input type="text" class="form-control" name="port_0_external" value="${ports_data[0].external}"/>
                                </div>
                                <div class="col">
                                  <label class="form-label">Internal Port</label>
                                  <input type="text" class="form-control" name="port_0_internal" value="${ports_data[0].internal}"/>
                                </div>
                                <div class="col-lg-2">
                                  <label class="form-label">Protocol</label>
                                  <select class="form-select" name="port_0_protocol">
                                    <option value="${ports_data[0].protocol}" selected hidden>${ports_data[0].protocol}</option>
                                    <option value="tcp">tcp</option>
                                    <option value="udp">udp</option>
                                  </select>
                                </div>
                              </div>
            
                              <div class="row mb-1 align-items-end">
                                <div class="col-auto">
                                  <input class="form-check-input" name="port_1_check" type="checkbox" ${ports_data[1].check}>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="port_1_external" value="${ports_data[1].external}"/>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="port_1_internal" value="${ports_data[1].internal}"/>
                                </div>
                                <div class="col-lg-2">
                                  <select class="form-select" name="port_1_protocol">
                                    <option value="${ports_data[1].protocol}" selected hidden>${ports_data[1].protocol}</option>
                                    <option value="tcp">tcp</option>
                                    <option value="udp">udp</option>
                                  </select>
                                </div>
                              </div>
            
                              <div class="row mb-1 align-items-end">
                                <div class="col-auto">
                                  <input class="form-check-input" name="port_2_check" type="checkbox" ${ports_data[2].check}>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="port_2_external" value="${ports_data[2].external}"/>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="port_2_internal" value="${ports_data[2].internal}"/>
                                </div>
                                <div class="col-lg-2">
                                  <select class="form-select" name="port_2_protocol">
                                    <option value="${ports_data[2].protocol}" selected hidden>${ports_data[2].protocol}</option>
                                    <option value="tcp">tcp</option>
                                    <option value="udp">udp</option>
                                  </select>
                                </div>
                              </div>
            
                              <div class="row mb-1 align-items-end">
                                <div class="col-auto">
                                  <input class="form-check-input" name="port_3_check" type="checkbox" ${ports_data[3].check}>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="port_3_external" value="${ports_data[3].external}"/>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="port_3_internal" value="${ports_data[3].internal}"/>
                                </div>
                                <div class="col-lg-2">
                                  <select class="form-select" name="port_3_protocol">
                                    <option value="${ports_data[3].protocol}" selected hidden>${ports_data[3].protocol}</option>
                                    <option value="tcp">tcp</option>
                                    <option value="udp">udp</option>
                                  </select>
                                </div>
                              </div>
            
                              <div class="row mb-1 align-items-end">
                                <div class="col-auto">
                                  <input class="form-check-input" name="port_4_check" type="checkbox" ${ports_data[4].check}>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="port_4_external" value="${ports_data[4].external}"/>
                                </div>
                                <div class="col">
                                  <input type="text" class="form-control" name="port_4_internal" value="${ports_data[4].internal}"/>
                                </div>
                                <div class="col-lg-2">
                                  <select class="form-select" name="port_4_protocol">
                                    <option value="${ports_data[4].protocol}" selected hidden>${ports_data[4].protocol}</option>
                                    <option value="tcp">tcp</option>
                                    <option value="udp">udp</option>
                                  </select>
                                </div>
                              </div>
            
                              <div class="row mb-1 align-items-end">
                                <div class="col-auto">
                                  <input class="form-check-input" name="" type="checkbox" >
                                </div>
                                <div class="col">
                                  <label class="form-label">External Port</label>
                                  <input type="text" class="form-control" name="" value=""/>
                                </div>
                                <div class="col">
                                  <label class="form-label">Internal Port</label>
                                  <input type="text" class="form-control" name="" value=""/>
                                </div>
                                <div class="col-lg-2">
                                  <label class="form-label">Protocol</label>
                                  <select class="form-select" name="">
                                    <option value="" selected hidden></option>
                                    <option value="tcp">tcp</option>
                                    <option value="udp">udp</option>
                                  </select>
                                </div>
                              </div>
            
            
                            </div>
                          </div>
                        </div>



                      </div>
            
            
                      
                      </form>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn me-auto" data-bs-dismiss="modal">Close</button>
                      <input type="submit" form="${form_id}_install" class="btn btn-success" value="Install"/>
                    </div>
                  </div>
                </div>
              </div>`;
}