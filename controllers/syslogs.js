import { Syslog } from '../database/config.js';
import { ServerSettings } from '../database/config.js';
import { Alert, getLanguage, Navbar } from '../utils/system.js';

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

        logs += `<tr>
                    <td class="sort-id">${log.id}</td>
                    <td class="sort-username">${log.username}</td>
                    <td class="sort-email">${log.email}</td>
                    <td class="sort-event">${log.event}</td>
                    <td class="sort-message">${log.message}</td>
                    <td class="sort-ip">${log.ip}</td>
                    <td class="sort-datetime">${datetime}</td>
                </tr>`
    }

    res.render("syslogs",{ 
        alert: '',
        username: req.session.username,
        role: req.session.role,
        logs: logs,
        navbar: await Navbar(req),
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
    });

}