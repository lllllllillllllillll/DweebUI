export const permissionsModal = (data) => {
  

  let modal = `
        <div class="modal-dialog modal-sm modal-dialog-centered modal-dialog-scrollables">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Permissions</h5>
            </div>
            <div class="modal-body">
              <form action="" id="permissions_modal" method="POST">
            
              <div class="accordion" id="modal-accordion">


                <div class="accordion-item mb-3" style="border: 1px solid grey;">
                  <h2 class="accordion-header" id="heading-1">
                    <button class="accordion-button collapsed row" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-1" aria-expanded="false">
                      <span class="avatar avatar-sm bg-green-lt col-3 text-start">JD</span>
                        <div class="col text-end" style="margin-right: 10px;">Jane Doe</div>
                    </button>
                  </h2>
                  <div id="collapse-1" class="accordion-collapse collapse" data-bs-parent="#modal-accordion">
                    <div class="accordion-body pt-0">


                      <div class="">
                        <div class="">

                          <div class="row mb-3">
                            <div class="col-9">
                              <label class="row text-start">
                                <span class="col">
                                  All
                                </span>
                              </label>
                            </div>
                            <div class="col-3">
                              <label class="form-check form-check-single form-switch text-end">
                                <input class="form-check-input" type="checkbox" name="select" onclick="selectAll('select')">
                              </label>
                            </div>
                          </div>
          
                          <div class="row mb-2">
                            <div class="col-9">
                              <label class="row text-start">
                                <span class="col">
                                  Uninstall
                                </span>
                              </label>
                            </div>
                            <div class="col-3">
                              <label class="form-check form-check-single form-switch text-end">
                                <input class="form-check-input" type="checkbox" name="select">
                              </label>
                            </div>
                          </div>
          
                          <div class="row mb-2">
                            <div class="col-9">
                              <label class="row text-start">
                                <span class="col">
                                  Edit
                                </span>
                              </label>
                            </div>
                            <div class="col-3">
                              <label class="form-check form-check-single form-switch text-end">
                                <input class="form-check-input" type="checkbox" name="select">
                              </label>
                            </div>
                          </div>

                          <div class="row mb-2">
                            <div class="col-9">
                              <label class="row text-start">
                                <span class="col">
                                  Upgrade
                                </span>
                              </label>
                            </div>
                            <div class="col-3">
                              <label class="form-check form-check-single form-switch text-end">
                                <input class="form-check-input" type="checkbox" name="select">
                              </label>
                            </div>
                          </div>

                          <div class="row mb-2">
                            <div class="col-9">
                              <label class="row text-start">
                                <span class="col">
                                  Start
                                </span>
                              </label>
                            </div>
                            <div class="col-3">
                              <label class="form-check form-check-single form-switch text-end">
                                <input class="form-check-input" type="checkbox" name="select">
                              </label>
                            </div>
                          </div>

                          <div class="row mb-2">
                            <div class="col-9">
                              <label class="row text-start">
                                <span class="col">
                                  Stop
                                </span>
                              </label>
                            </div>
                            <div class="col-3">
                              <label class="form-check form-check-single form-switch text-end">
                                <input class="form-check-input" type="checkbox" name="select">
                              </label>
                            </div>
                          </div>

                          <div class="row mb-2">
                            <div class="col-9">
                              <label class="row text-start">
                                <span class="col">
                                  Pause
                                </span>
                              </label>
                            </div>
                            <div class="col-3">
                              <label class="form-check form-check-single form-switch text-end">
                                <input class="form-check-input" type="checkbox" name="select">
                              </label>
                            </div>
                          </div>

                          <div class="row mb-2">
                            <div class="col-9">
                              <label class="row text-start">
                                <span class="col">
                                  Restart
                                </span>
                              </label>
                            </div>
                            <div class="col-3">
                              <label class="form-check form-check-single form-switch text-end">
                                <input class="form-check-input" type="checkbox" name="select">
                              </label>
                            </div>
                          </div>


                          <div class="row mb-2">
                            <div class="col-9">
                              <label class="row text-start">
                                <span class="col">
                                  Logs
                                </span>
                              </label>
                            </div>
                            <div class="col-3">
                              <label class="form-check form-check-single form-switch text-end">
                                <input class="form-check-input" type="checkbox" name="select">
                              </label>
                            </div>
                          </div>


                        </div>
                      </div>

                    </div>
                  </div>
                </div>


                <div class="accordion-item mb-3" style="border: 1px solid grey;">
                  <h2 class="accordion-header" id="heading-2">
                    <button class="accordion-button collapsed row" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-2" aria-expanded="false">
                      <span class="avatar avatar-sm bg-cyan-lt col-3 text-start">JD</span>
                        <div class="col text-end" style="margin-right: 10px;">John Doe</div>
                    </button>
                  </h2>
                  <div id="collapse-2" class="accordion-collapse collapse" data-bs-parent="#modal-accordion">
                    <div class="accordion-body pt-0">


                      <div class="">
                        <div class="">

                          <div class="row mb-3">
                            <div class="col-9">
                              <label class="row text-start">
                                <span class="col">
                                  All
                                </span>
                              </label>
                            </div>
                            <div class="col-3">
                              <label class="form-check form-check-single form-switch text-end">
                                <input class="form-check-input" type="checkbox" name="remove_image">
                              </label>
                            </div>
                          </div>

                          <div class="row mb-2">
                            <div class="col-9">
                              <label class="row text-start">
                                <span class="col">
                                  View
                                </span>
                              </label>
                            </div>
                            <div class="col-3">
                              <label class="form-check form-check-single form-switch text-end">
                                <input class="form-check-input" type="checkbox" name="remove_image">
                              </label>
                            </div>
                          </div>
          
                          <div class="row mb-2">
                            <div class="col-9">
                              <label class="row text-start">
                                <span class="col">
                                  Uninstall
                                </span>
                              </label>
                            </div>
                            <div class="col-3">
                              <label class="form-check form-check-single form-switch text-end">
                                <input class="form-check-input" type="checkbox" name="remove_image">
                              </label>
                            </div>
                          </div>
          
                          <div class="row mb-2">
                            <div class="col-9">
                              <label class="row text-start">
                                <span class="col">
                                  Edit
                                </span>
                              </label>
                            </div>
                            <div class="col-3">
                              <label class="form-check form-check-single form-switch text-end">
                                <input class="form-check-input" type="checkbox" name="remove_backups">
                              </label>
                            </div>
                          </div>

                          <div class="row mb-2">
                            <div class="col-9">
                              <label class="row text-start">
                                <span class="col">
                                  Upgrade
                                </span>
                              </label>
                            </div>
                            <div class="col-3">
                              <label class="form-check form-check-single form-switch text-end">
                                <input class="form-check-input" type="checkbox" name="remove_backups">
                              </label>
                            </div>
                          </div>

                          <div class="row mb-2">
                            <div class="col-9">
                              <label class="row text-start">
                                <span class="col">
                                  Start
                                </span>
                              </label>
                            </div>
                            <div class="col-3">
                              <label class="form-check form-check-single form-switch text-end">
                                <input class="form-check-input" type="checkbox" name="remove_backups">
                              </label>
                            </div>
                          </div>

                          <div class="row mb-2">
                            <div class="col-9">
                              <label class="row text-start">
                                <span class="col">
                                  Stop
                                </span>
                              </label>
                            </div>
                            <div class="col-3">
                              <label class="form-check form-check-single form-switch text-end">
                                <input class="form-check-input" type="checkbox" name="remove_backups">
                              </label>
                            </div>
                          </div>

                          <div class="row mb-2">
                            <div class="col-9">
                              <label class="row text-start">
                                <span class="col">
                                  Pause
                                </span>
                              </label>
                            </div>
                            <div class="col-3">
                              <label class="form-check form-check-single form-switch text-end">
                                <input class="form-check-input" type="checkbox" name="remove_backups">
                              </label>
                            </div>
                          </div>

                          <div class="row mb-2">
                            <div class="col-9">
                              <label class="row text-start">
                                <span class="col">
                                  Restart
                                </span>
                              </label>
                            </div>
                            <div class="col-3">
                              <label class="form-check form-check-single form-switch text-end">
                                <input class="form-check-input" type="checkbox" name="remove_backups">
                              </label>
                            </div>
                          </div>


                          <div class="row mb-2">
                            <div class="col-9">
                              <label class="row text-start">
                                <span class="col">
                                  Logs
                                </span>
                              </label>
                            </div>
                            <div class="col-3">
                              <label class="form-check form-check-single form-switch text-end">
                                <input class="form-check-input" type="checkbox" name="remove_backups">
                              </label>
                            </div>
                          </div>


                        </div>
                      </div>

                    </div>
                  </div>
                </div>


              </div>
              </form>
            </div>
            <div class="modal-footer">
              <div class="row">

                <div class="col">
                  <label class="form-check form-switch col">
                    <span class="form-check-label">Reset</span>
                    <input class="form-check-input" type="checkbox">
                  </label>
                </div>
              
                <div class="col">
                  <button type="button" class="btn btn-danger" data-bs-dismiss="modal" disabled="">Reset</button>
                </div>
                <div class="col">
                  <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Update</button>
                </div>
              </div>
            </div>
          </div>
        </div>`;

    return modal;
}