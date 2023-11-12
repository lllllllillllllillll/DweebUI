const { readFileSync, writeFileSync, appendFileSync, readdirSync } = require('fs');
const { execSync } = require("child_process");
const { siteCard } = require('../components/siteCard');


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
        execSync(`docker exec caddy caddy fmt --overwrite /etc/caddy/sites/${domain}.Caddyfile`, (err, stdout, stderr) => {
            if (err) { console.error(`error: ${err.message}`); return; }
            if (stderr) { console.error(`stderr: ${stderr}`); return; }
            if (stdout) { console.log(`stdout:\n${stdout}`); return; }
            console.log(`Formatted ${domain}.Caddyfile`)
        });
        

        let site = siteCard(type, domain, host, port, 0);

        // reload caddy config to enable new site
        execSync(`docker exec caddy caddy reload --config /etc/caddy/Caddyfile`, (err, stdout, stderr) => {
            if (err) { console.error(`error: ${err.message}`); return; }
            if (stderr) { console.error(`stderr: ${stderr}`); return; }
            if (stdout) { console.log(`stdout:\n${stdout}`); return; }
            console.log(`reloaded caddy config`)
        });

        // append the site to site_list.ejs
        appendFileSync('./views/partials/site_list.ejs', site, function (err) { console.log(err) });

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
            console.log(`${key}: ${value}`);
            execSync(`rm /home/docker/caddy/sites/${value}.Caddyfile`, (err, stdout, stderr) => {
                if (err) { console.error(`error: ${err.message}`); return; }
                if (stderr) { console.error(`stderr: ${stderr}`); return; }
                console.log(`removed ${value}.Caddyfile`);
            });
        }

        
        // reload caddy config to disable sites
        try {
            execSync(`docker exec caddy caddy reload --config /etc/caddy/Caddyfile`, (err, stdout, stderr) => {
            if (err) { console.error(`error: ${err.message}`); return; }
            if (stderr) { console.error(`stderr: ${stderr}`); return; }
            console.log(`reloaded caddy config`)
        }); } catch (error) { console.log("No sites to reload") }

        
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
        writeFileSync('./views/partials/site_list.ejs', '', function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log('site_list.ejs has been cleared');
            }
        });
        

        // check if /home/docker/caddy/sites/ contains any .json files, then delete them
        try {
            let files = readdirSync('/home/docker/caddy/sites/');
            files.forEach(file => {
                if (file.includes(".json")) {
                    execSync(`rm /home/docker/caddy/sites/${file}`, (err, stdout, stderr) => {
                        if (err) { console.error(`error: ${err.message}`); return; }
                        if (stderr) { console.error(`stderr: ${stderr}`); return; }
                        console.log(`removed ${file}`);
                    });
                }
            });
        } catch (error) { console.log("No .json files to delete") }
   
        // get list of Caddyfiles
        let sites = readdirSync('/home/docker/caddy/sites/');

        sites.forEach(site_name => {

            // convert the caddyfile of each site to json
            execSync(`docker exec caddy caddy adapt --config /etc/caddy/sites/${site_name} --pretty >> /home/docker/caddy/sites/${site_name}.json`, (err, stdout, stderr) => {
                if (err) { console.error(`error: ${err.message}`); return; }
                if (stderr) { console.error(`stderr: ${stderr}`); return; }
                console.log(`stdout:\n${stdout}`);
            });
            
            // read the json file
            let site_file = readFileSync(`/home/docker/caddy/sites/${site_name}.json`, 'utf8');

            // fix whitespace and parse the json file
            site_file = site_file.replace(/        /g, "  ");
            site_file = JSON.parse(site_file);

            // get the domain, type, host, and port from the json file
            try { domain = site_file.apps.http.servers.srv0.routes[0].match[0].host[0] } catch (error) { console.log("No Domain") }
            try { type = site_file.apps.http.servers.srv0.routes[0].handle[0].routes[0].handle[1].handler } catch (error) { console.log("No Type") }
            try { host = site_file.apps.http.servers.srv0.routes[0].handle[0].routes[0].handle[1].upstreams[0].dial.split(":")[0] } catch (error) { console.log("Not Localhost") }
            try { port = site_file.apps.http.servers.srv0.routes[0].handle[0].routes[0].handle[1].upstreams[0].dial.split(":")[1] } catch (error) { console.log("No Port") }

            // build the site card
            let site = siteCard(type, domain, host, port, id);

            // append the site card to site_list.ejs
            appendFileSync('./views/partials/site_list.ejs', site, function (err) { console.log(err) });
            
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