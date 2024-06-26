import { Syslog } from '../database/models.js';

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
                    <td class="sort-user">${log.user}</td>
                    <td class="sort-email">${log.email}</td>
                    <td class="sort-event">${log.event}</td>
                    <td class="sort-message">${log.message}</td>
                    <td class="sort-ip">${log.ip}</td>
                    <td class="sort-datetime">${datetime}</td>
                </tr>`
    }
    
    res.render("syslogs", {
        name: req.session.user || 'Dev',
        role: req.session.role || 'Dev',
        avatar: req.session.user.charAt(0).toUpperCase(),
        logs: logs,
        alert: '',
        link1: '',
        link2: '',
        link3: '',
        link4: '',
        link5: '',
        link6: '',
        link7: '',
        link8: '',
        link9: '',
    });

}