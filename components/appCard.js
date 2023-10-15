function appCard(data) {

  // make data.title lowercase
  let app_name = data.name || data.title.toLowerCase();
  let shortened_name = "";
  let shortened_desc = data.description.slice(0, 60) + "...";
  let modal = app_name.replaceAll(" ", "-");
  let form_id = app_name.replaceAll("-", "_");
  let note = data.note ? data.note.replaceAll(". ", ".\n") : "no notes available";
  let description = data.description.replaceAll(". ", ".\n") || "no description available";
  let command = data.command ? data.command : "";
  let command_check = command ? "checked" : "";


  // if data.network is set to host, bridge, or docker set the radio button to checked
  let net_host, net_bridge, net_docker = '';
  let net_name = 'AppBridge';
  
  if (data.network == 'host') {
    net_host = 'checked';
  } else if (data.network) {
    net_bridge = 'checked';
    net_name = data.network;
  } else {
    net_docker = 'checked';
  }


  if (data.title.length > 28) {
    shortened_name = (data.title).slice(0, 25) + "...";
  }
  else {
    shortened_name = data.title;
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

  // set data.catagories to 'other' if data.catagories is empty or undefined
  if (data.categories == null || data.categories == undefined || data.categories == '') {
    data.categories = ['Other'];
  }

  let categories = '';

  for (let i = 0; i < data.categories.length; i++) {
    categories += CatagoryColor(data.categories[i]);
  }

  if (data.restart_policy == null) {
    data.restart_policy = 'unless-stopped';
  }

  let ports_data = [], volumes_data = [], env_data = [], label_data = [];

  for (let i = 0; i < 12; i++) {
    
    // Get port details
    try {
      let ports = data.ports[i];
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
      let volumes = data.volumes[i];
      let volume_check = volumes ? "checked" : "";
      let volume_bind = volumes.bind.split(":")[0] ? volumes.bind.split(":")[0] : "";
      let volume_container = volumes.container.split(":")[0] ? volumes.container.split(":")[0] : "";
      let volume_readwrite = volumes.container.endsWith(":ro") ? "ro" : "rw";

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
      let env = data.env[i];
      let env_check = env ? "checked" : "";
      let env_default = env.default ? env.default : "";
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
      let label = data.labels[i];
      let label_check = label ? "checked" : "";
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



  return `
  <div class="col-md-6 col-lg-3">
    <div class="card">
      <div class="card-body p-4 text-center">
        <span class="avatar avatar-xlplus mb-3 rounded"><img src='${data.logo}' width="144px" height="144px" loading="lazy"></img></span>
        <h3 class="m-0 mb-1"><a href="#">${shortened_name}</a></h3>
        <div class="text-secondary">${shortened_desc}</div>
        <div class="mt-3">
          ${categories}
        </div>
      </div>
      <div class="d-flex">
        <a href="#" class="card-btn" data-bs-toggle="modal" data-bs-target="#${modal}-info"><!-- Download SVG icon from http://tabler-icons.io/i/mail -->
          <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-article" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"> <path stroke="none" d="M0 0h24v24H0z" fill="none"></path> <path d="M3 4m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"></path> <path d="M7 8h10"></path> <path d="M7 12h10"></path> <path d="M7 16h10"></path></svg>
            Learn More
        </a>
        <a href="#" class="card-btn" data-bs-toggle="modal" data-bs-target="#${modal}-install"><!-- Download SVG icon from http://tabler-icons.io/i/phone -->
        <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-arrow-bar-to-down" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"> <path stroke="none" d="M0 0h24v24H0z" fill="none"></path> <path d="M4 20l16 0"></path> <path d="M12 14l0 -10"></path> <path d="M12 14l4 -4"></path> <path d="M12 14l-4 -4"></path></svg>
          Install
        </a>
      </div>
    </div>
  </div>

  <div class="modal modal-blur fade" id="${modal}-info" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-sm modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-body">
          <div class="modal-title">${data.title}</div>
          <div>${description}</div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-link link-secondary me-auto" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Okay</button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal modal-blur fade" id="${modal}-install" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" role="document">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title">Install ${data.title}</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
            
                    
                    <div class="modal-body">
                      
                    <pre class="text-secondary">${note}</pre>
                    
                      <form action="/install" name="${form_id}_install" id="${form_id}_install" method="POST">
                      
                      <div class="row mb-3 align-items-end">
                        
                        <div class="col-lg-6">
                          <label class="form-label">Container Name: </label>
                          <input type="text" class="form-control" name="service_name" value="${app_name}" hidden/>
                          <input type="text" class="form-control" name="name" value="${app_name}"/>
                        </div>
                        <div class="col-lg-3">
                          <label class="form-label">Image: </label>
                          <input type="text" class="form-control" name="image" value="${data.image}"/>
                        </div>
                        <div class="col-lg-3">
                          <label class="form-label">Restart Policy: </label>
                          <select class="form-select" name="restart_policy">
                            <option value="${data.restart_policy}" selected hidden>${data.restart_policy}</option>
                            <option value="unless-stopped">unless-stopped</option>
                            <option value="on-failure">on-failure</option>
                            <option value="never">never</option>
                            <option value="always">always</option>
                          </select>
                        </div>
                      </div>
            
                      <label class="form-label">Network Mode</label>
                        <div class="form-selectgroup-boxes row mb-3">
                          <div class="col">
                            <label class="form-selectgroup-item">
                              <input type="radio" name="net_mode" value="host" class="form-selectgroup-input" ${net_host}>
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
                              <input type="radio" name="net_mode" value="${net_name}" class="form-selectgroup-input" ${net_bridge}>
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
                            <input type="radio" name="net_mode" value="docker" class="form-selectgroup-input" ${net_docker}>
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
                                  <input class="form-check-input" name="command_check" type="checkbox" ${command_check}>
                                </div>
                                <div class="col">
                                  <label class="form-label">Command</label>
                                  <input type="text" class="form-control" name="command" value="${command}"/>
                                </div>
                              </div>

                              <div class="row mb-1 align-items-end">
                                <div class="col-auto">
                                  <input class="form-check-input" name="hwa_check" type="checkbox">
                                </div>
                                <div class="col">
                                  <label class="form-label">Nvidia Hardware Acceleration</label>
                                  <input type="text" class="form-control" name="command" value="Nvidia"/>
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

module.exports = { appCard };
