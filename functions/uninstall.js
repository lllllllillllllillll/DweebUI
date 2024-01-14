import { docker } from "../server.js";
import { Syslog } from "../database/models.js";


export const Uninstall = async (req, res) => {

    let { confirm, service_name } = req.body;

    if (confirm == 'Yes') {
        var containerName = docker.getContainer(`${service_name}`);
        try {
            await containerName.stop();
        } catch {
            console.log(`Error stopping ${service_name} container`);
        }
        try {
            await containerName.remove();
            

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
    }
    res.redirect('/');
}

