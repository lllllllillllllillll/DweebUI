import { docker } from "../utils/docker.js";
import { Syslog } from "../database/config.js";


export const Uninstall = async (req, res) => {

    let { confirm, service_id } = req.body;

    console.log(req.body);

    console.log(`Uninstalling ${service_id}...`);

    if (confirm == 'Yes') {

        let containerName = docker.getContainer(service_id);
        console.log(`Stopping ${service_id}...`)
        try {
            await containerName.stop();
        } catch {
            console.log(`Error stopping ${service_id} container`);
        }

        try {
            console.log(`Removing ${service_id}...`);
            containerName.remove();
            
            const syslog = await Syslog.create({
                user: req.session.user,
                email: null,
                event: "App Removal",
                message: `${service_id} uninstalled successfully`,
                ip: req.socket.remoteAddress
            });


        } catch {
            const syslog = await Syslog.create({
                user: req.session.user,
                email: null,
                event: "App Removal",
                message: `${service_id} uninstallation failed`,
                ip: req.socket.remoteAddress
            });
        }
    } else {
        console.log(`Didn't confirm uninstallation of ${service_id}...`);
    }

    res.redirect('/');
}

