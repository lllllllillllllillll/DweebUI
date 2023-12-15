const User = require('../database/UserModel');
const Containers = require('../database/ContainerSettings');

const { readFileSync, writeFileSync, appendFileSync, readdirSync } = require('fs');
const { execSync } = require("child_process");
const { siteCard } = require('../components/siteCard');
const { containerExec } = require('../functions/system')



exports.Dashboard = async function (req, res) {

    if (req.session.role == "admin") {

        // get user data with matching UUID from sqlite database
        let user = await User.findOne({ where: { UUID: req.session.UUID } });

        let caddy = 'd-none';

        if (process.env.Proxy_Manager == 'enabled') {
            caddy = '';
        }

        // Render the home page
        res.render("pages/dashboard", {
            name: user.first_name + ' ' + user.last_name,
            role: user.role,
            avatar: user.avatar,
            isLoggedIn: true,
            site_list: req.app.locals.site_list,
            caddy: caddy
        });
    } else {
        // Redirect to the login page
        res.redirect("/login");
    }
}



exports.AddSite = async function (req, res) {

    let { domain, type, host, port } = req.body;

    if ((req.session.role == "admin") && ( domain && type && host && port)) {


        let { domain, type, host, port } = req.body;

        // build caddyfile
        let caddyfile = `${domain} {`
        caddyfile += `\n\t${type} ${host}:${port}`
        caddyfile += `\n\theader {`
        caddyfile += `\n\t\tStrict-Transport-Security "max-age=31536000; includeSubDomains; preload"`
        caddyfile += `\n\t}`
        caddyfile += `\n}`

        
        // save caddyfile
        writeFileSync(`./caddyfiles/sites/${domain}.Caddyfile`, caddyfile, function (err) { console.log(err) });


        // format caddyfile
        let format = {
            container: 'DweebProxy',
            command: `caddy fmt --overwrite /etc/caddy/sites/${domain}.Caddyfile`
        }
        await containerExec(format, function(err, data) {
            if (err) {
                console.error(err);
                return;
            }
            console.log(`Formatted ${domain}.Caddyfile`);
        });
        
        ///////////////// convert caddyfile to json
        let convert = {
            container: 'DweebProxy',
            command: `caddy adapt --config /etc/caddy/sites/${domain}.Caddyfile --pretty >> /etc/caddy/sites/${domain}.json`
        }
        await containerExec(convert, function(err, data) {
            if (err) {
                console.error(err);
                return;
            }
            console.log(`Converted ${domain}.Caddyfile to JSON`);
        });

        ////////////// reload caddy
        let reload = {
            container: 'DweebProxy',
            command: `caddy reload --config /etc/caddy/Caddyfile`
        }
        await containerExec(reload, function(err, data) {
            if (err) {
                console.error(err);
                return;
            }
            console.log(`Reloaded Caddy Config`);
        });

        let site = siteCard(type, domain, host, port, 0);

        req.app.locals.site_list += site;


        res.redirect("/");
    } else {
        // Redirect
        console.log('not admin or missing info')
        res.redirect("/");
    }
}


exports.RemoveSite = async function (req, res) {

    if (req.session.role == "admin") {


        for (const [key, value] of Object.entries(req.body)) {

            execSync(`rm ./caddyfiles/sites/${value}.Caddyfile`, (err, stdout, stderr) => {
                if (err) { console.error(`error: ${err.message}`); return; }
                if (stderr) { console.error(`stderr: ${stderr}`); return; }
                console.log(`removed ${value}.Caddyfile`);
            });

        }

        let reload = {
            container: 'DweebProxy',
            command: `caddy reload --config /etc/caddy/Caddyfile`
        }
        await containerExec(reload);

        
        console.log('Removed Site(s)')

        res.redirect("/refreshsites");
    } else {
        res.redirect("/");
    }
    
}


exports.RefreshSites = async function (req, res) {

    let domain, type, host, port;
    let id = 1;

    if (req.session.role == "admin") {


        // Clear site_list.ejs
        req.app.locals.site_list = "";
        

        // check if ./caddyfiles/sites contains any .json files, then delete them
        try {
            let files = readdirSync('./caddyfiles/sites/');
            files.forEach(file => {
                if (file.includes(".json")) {
                    execSync(`rm ./caddyfiles/sites/${file}`, (err, stdout, stderr) => {
                        if (err) { console.error(`error: ${err.message}`); return; }
                        if (stderr) { console.error(`stderr: ${stderr}`); return; }
                        console.log(`removed ${file}`);
                    });
                }
            });
        } catch (error) { console.log("No .json files to delete") }
   
        // get list of Caddyfiles
        let sites = readdirSync('./caddyfiles/sites/');


        sites.forEach(site_name => {
            // convert the caddyfile of each site to json
            let convert = {
                container: 'DweebProxy',
                command: `caddy adapt --config ./caddyfiles/sites/${site_name} --pretty >> ./caddyfiles/sites/${site_name}.json`
            }
            containerExec(convert);

            try {
            // read the json file
            let site_file = readFileSync(`./caddyfiles/sites/${site_name}.json`, 'utf8');
            // fix whitespace and parse the json file
            site_file = site_file.replace(/        /g, "  ");
            site_file = JSON.parse(site_file);
            } catch (error) { console.log("No .json file to read") }


            // get the domain, type, host, and port from the json file
            try { domain = site_file.apps.http.servers.srv0.routes[0].match[0].host[0] } catch (error) { console.log("No Domain") }
            try { type = site_file.apps.http.servers.srv0.routes[0].handle[0].routes[0].handle[1].handler } catch (error) { console.log("No Type") }
            try { host = site_file.apps.http.servers.srv0.routes[0].handle[0].routes[0].handle[1].upstreams[0].dial.split(":")[0] } catch (error) { console.log("Not Localhost") }
            try { port = site_file.apps.http.servers.srv0.routes[0].handle[0].routes[0].handle[1].upstreams[0].dial.split(":")[1] } catch (error) { console.log("No Port") }

            // build the site card
            let site = siteCard(type, domain, host, port, id);

            // append the site card to site_list
            req.app.locals.site_list += site;
            
            id++;
        });
        

        res.redirect("/");
    } else {
        // Redirect to the login page
        res.redirect("/");
    }
}



exports.DisableSite = async function (req, res) {

    if (req.session.role == "admin") {

        
        console.log(req.body)
        console.log('Disable Site')

        res.redirect("/");
    } else {
        // Redirect to the login page
        res.redirect("/login");
    }
}


exports.EnableSite = async function (req, res) {

    if (req.session.role == "admin") {

        
        console.log(req.body)
        console.log('Enable Site')

        res.redirect("/");
    } else {
        // Redirect to the login page
        res.redirect("/login");
    }
}