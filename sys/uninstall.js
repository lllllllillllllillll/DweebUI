import { docker, docker2, docker3, docker4 } from "./docker.js";
import { Syslog, Container } from "./db.js";
import { Alert } from "./utils.js";
import { rmSync } from "fs";

export const Uninstall = async (req, res) => {

    let { service_id, appname, confirm } = req.body;
    // let host = req.session.host || 1;

    // If anything other than 'Yes' is entered in the confirmation box, redirect back to the main page
    if (confirm != 'Yes') {
        console.log(`Uninstall not confirmed for ${service_id}...`);
        // Alert(type, message)
        req.session.alert = Alert('danger', 'Uninstall failed. Need to confirm with "Yes"');
        // Log the event
        const syslog = await Syslog.create({
            user: req.session.user,
            email: null,
            event: "App Removal",
            message: `${service_id} uninstall not confirmed`,
            ip: req.ip
        });
        res.redirect('/');
        return;
    }

    // If 'Yes' was entered, find which docker instance the service is running on, stop it, then remove it
    console.log(`Uninstall.js: Uninstalling ${appname}...`);

    let container = await Container.findOne({ where: { containerID: service_id } });
    let host = container.host;

    if (host == 0) {
        try { container = docker.getContainer(service_id); } catch { console.log(`Container ${service_id} not on host 1.`); }
        try { container = docker2.getContainer(service_id); } catch { console.log(`Container ${service_id} not on host 2.`); }
        try { container = docker3.getContainer(service_id); } catch { console.log(`Container ${service_id} not on host 3.`); }
        try { container = docker4.getContainer(service_id); } catch { console.log(`Container ${service_id} not on host 4.`); }
    }
    else if (host == 1) {
        try { container = docker.getContainer(service_id); } catch { console.log(`Container ${service_id} not on host 1.`); }
    }
    else if (host == 2) {
        try { container = docker2.getContainer(service_id); } catch { console.log(`Container ${service_id} not on host 2.`); }
    }
    else if (host == 3) {
        try { container = docker3.getContainer(service_id); } catch { console.log(`Container ${service_id} not on host 3.`); }
    }
    else if (host == 4) {
        try { container = docker4.getContainer(service_id); } catch { console.log(`Container ${service_id} not on host 4.`); }
    }

    try { console.log(`Stopping ${service_id}...`); await container.stop(); } catch { console.log(`${service_id} isn't running.`); }

    try {
        console.log(`Removing ${service_id}...`);
        container.remove();
        
        req.session.alert = Alert('success', `${appname} uninstalled successfully`);

        const syslog = await Syslog.create({
            user: req.session.user,
            email: null,
            event: "App Removal",
            message: `${service_id} uninstalled successfully`,
            ip: req.ip
        });


    } catch {
        const syslog = await Syslog.create({
            user: req.session.user,
            email: null,
            event: "App Removal",
            message: `${service_id} uninstallation failed`,
            ip: req.ip
        });
    }
    
    res.redirect('/');
}

