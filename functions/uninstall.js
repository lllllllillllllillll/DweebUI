import { writeFileSync, mkdirSync, readFileSync } from "fs";
import yaml from 'js-yaml';
import { execSync } from "child_process";
import { docker } from "../app.js";
import DockerodeCompose from "dockerode-compose";



export const Uninstall = async (req, res) => {

    console.log('Uninstall')
    console.log(req.body);

    res.render("/apps", {
        name: req.session.user,
        role: req.session.role,
        avatar: req.session.avatar,
        list_start: 0,
        list_end: 28,
        app_count: 0,
        prev: 0,
        next: 0,
        apps_list: 0,
    });

}


