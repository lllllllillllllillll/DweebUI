import { docker, docker2, docker3, docker4 } from "../utils/docker.js";
import { Syslog } from "../db/config.js";
import { Alert } from "../utils/system.js";
import fs from 'fs';

export const Uninstall = async (req, res) => {

    console.log(`Uninstall.js: Uninstalling ${req.body.service_id}...`);
    console.log(`Host ${req.session.host}`);

    let { confirm, service_id } = req.body;
    let host = req.session.host || 1;

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
    let container;

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
        
        // Remove the app files from ./appdata/appname
        fs.rmdirSync(`./appdata/${service_id}`, { recursive: true });

        req.session.alert = Alert('success', `${service_id} uninstalled successfully`);

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

