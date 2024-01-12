import { docker } from "../app.js";


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
            console.log(`Removed ${service_name} container`);
        } catch {
            console.log(`Error removing ${service_name} container`);
        }
    }
    res.redirect('/');
}

