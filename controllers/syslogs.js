import { Syslog } from '../database/config.js';
import { Alert, getLanguage, Navbar, Footer } from '../utils/system.js';

export const Syslogs = async function(req, res) {

    let logs = '';

    const syslogs = await Syslog.findAll({
        order: [
            ['id', 'DESC']
        ]
    });


    for (const log of syslogs) {
        let date = (log.createdAt).toDateString();
        let time = (log.createdAt).toLocaleTimeString();
        let datetime = `${time} ${date}`;


        // get the last 12 characters of the uniqueID
        let uniqueID = log.uniqueID;
        // if (uniqueID.length > 12) {
        //     uniqueID = uniqueID.substring(uniqueID.length - 12);
        // }

        let message = log.message;
        // if (message.length > 50) {
        //     message = message.substring(0, 50) + '...';
        // }

        logs += `<tr>
                    <td><input class="form-check-input m-0 align-middle" name="select" type="checkbox" aria-label="Select"></td>
                    <td class="sort-id">${log.id}</td>
                    <td class="sort-username">${log.username}</td>
                    <td class="sort-uniqueid">${uniqueID}</td>
                    <td class="sort-event">${log.event}</td>
                    <td class="sort-message">${message}</td>
                    <td class="sort-ip">${log.ip}</td>
                    <td class="sort-timestamp">${datetime}</td>
                    <td class="text-end"><a class="" href="#"><svg xmlns="http://www.w3.org/2000/svg" class="icon-tabler icon-tabler-player-play" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M7 4v16l13 -8z"></path></svg></a></td>

                </tr>`
    }

    res.render("syslogs",{ 
        alert: '',
        username: req.session.username,
        role: req.session.role,
        logs: logs,
        navbar: await Navbar(req),
        footer: await Footer(req),
    });
}



export const submitSyslogs = async function(req,res){

    // console.log(req.body);

    let trigger_name = req.header('hx-trigger-name');
    let trigger_id = req.header('hx-trigger');

    console.log(`trigger_name: ${trigger_name} - trigger_id: ${trigger_id}`);


    res.render("syslogs",{
        alert: '',
        username: req.session.username,
        role: req.session.role,
        navbar: await Navbar(req),
        footer: await Footer(req),
    });

}



export const searchSyslogs = async function (req, res) {
    console.log(`[Search] ${req.body.search}`);
    res.send('ok');
    return;
}