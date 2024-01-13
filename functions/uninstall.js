import { docker } from "../server.js";
import { Syslog } from "../database/models.js";


export const Uninstall = async (req, res) => {

    let { confirm, service_name } = req.body;

    if (confirm == 'Yes') {
        console.log(`Uninstalling ${service_name}`);
        var containerName = docker.getContainer(`${service_name}`);
        try {
            await containerName.stop();
            console.log(`Stopped ${service_name} container`);
        } catch {
            console.log(`Error stopping ${service_name} container`);
        }
        try {
            await containerName.remove();
            

            const syslog = await Syslog.create({
                user: req.session.user,
                email: null,
                event: "App Removal",
                message: `${service_name} uninstalled successfully}`,
                ip: req.socket.remoteAddress
            });


        } catch {
            console.log(`Error removing ${service_name} container`);
        }
    }
    res.redirect('/');
}

