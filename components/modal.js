export const modal = (data) => {
  
  let { name, state, image } = data;

  let ports_data = [];

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
  

  let volumes_data = [];
  
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
  


  let env_data = [];
  
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
  


  let label_data = [];
  
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
  


  let modal = `
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Details</h5>
      </div>
      <div class="modal-body">
        <pre class="text-secondary">note</pre>
          <form action="" id="details_modal" method="POST">
            <div class="row mb-3 align-items-end">
              <div class="col-lg-6">
                <label class="form-label">Container Name: </label>
                <input type="text" class="form-control" name="service_name" value="${name}" hidden/>
                <input type="text" class="form-control" name="name" value="${name}"/>
              </div>
              <div class="col-lg-3">
                <label class="form-label">Image: </label>
                <input type="text" class="form-control" name="image" value="${image}"/>
              </div>
              <div class="col-lg-3">
                <label class="form-label">Restart Policy: </label>
                <select class="form-select" name="restart_policy" value="">
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
            
            <div class="accordion" id="modal-accordion">
                        <div class="accordion-item">
                          <h2 class="accordion-header" id="heading-1">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-1" aria-expanded="false">
                              Ports
                            </button>
                          </h2>
                          <div id="collapse-1" class="accordion-collapse collapse" data-bs-parent="#modal-accordion">
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
                          <div id="collapse-2" class="accordion-collapse collapse" data-bs-parent="#modal-accordion">
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
                          <div id="collapse-3" class="accordion-collapse collapse" data-bs-parent="#modal-accordion">
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
                          <div id="collapse-4" class="accordion-collapse collapse" data-bs-parent="#modal-accordion">
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
                          <div id="collapse-5" class="accordion-collapse collapse" data-bs-parent="#modal-accordion">
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
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>`;

  return modal;
}