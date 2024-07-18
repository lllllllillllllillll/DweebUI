import { docker } from "../utils/docker.js";
import { Syslog } from "../database/models.js";


export const Uninstall = async (req, res) => {

    let { confirm, service_name } = req.body;

    console.log(`Uninstalling ${service_name}...`);

    if (confirm == 'Yes') {

        let containerName = docker.getContainer(service_name);
        console.log(`Stopping ${service_name}...`)
        try {
            await containerName.stop();
        } catch {
            console.log(`Error stopping ${service_name} container`);
        }

        try {
            console.log(`Removing ${service_name}...`);
            containerName.remove();
            
            const syslog = await Syslog.create({
                user: req.session.user,
                email: null,
                event: "App Removal",
                message: `${service_name} uninstalled successfully`,
                ip: req.socket.remoteAddress
            });


        } catch {
            const syslog = await Syslog.create({
                user: req.session.user,
                email: null,
                event: "App Removal",
                message: `${service_name} uninstallation failed`,
                ip: req.socket.remoteAddress
            });
        }
    } else {
        console.log(`Didn't confirm uninstallation of ${service_name}...`);
    }

    res.redirect('/');
}

