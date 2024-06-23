import express from "express";
import { Permission } from '../database/models.js';
export const router = express.Router();

// Controllers
import { Login, submitLogin, Logout } from "../controllers/login.js";
import { Register, submitRegister } from "../controllers/register.js";
import { Dashboard, DashboardAction, Stats, Chart, SSE, UpdatePermissions } from "../controllers/dashboard.js";
import { Apps, appSearch, InstallModal, ImportModal, LearnMore, Upload, removeTemplate } from "../controllers/apps.js";
import { Users } from "../controllers/users.js";
import { Images } from "../controllers/images.js";
import { Networks, removeNetwork } from "../controllers/networks.js";
import { Volumes, addVolume, removeVolume } from "../controllers/volumes.js";
import { Account } from "../controllers/account.js";
import { Variables } from "../controllers/variables.js";
import { Settings, updateSettings } from "../controllers/settings.js";
import { Supporters, Thanks } from "../controllers/supporters.js";
import { Syslogs } from "../controllers/syslogs.js";
import { Install } from "../utils/install.js"
import { Uninstall } from "../utils/uninstall.js"

// Permission Middleware
const adminOnly = async (req, res, next) => {
    if (req.session.role == 'admin') { next(); }
    else { res.redirect('/dashboard'); }
}

const sessionCheck = async (req, res, next) => {
    if (req.session.user) { next(); }
    else { res.redirect('/login'); }
}

const permissionCheck = async (req, res, next) => {
    if (req.session.role == 'admin') { next(); return; }
    let user = req.session.user;
    let action = req.path.split("/")[2];
    let trigger = req.header('hx-trigger-name');
    const userAction = ['start', 'stop', 'restart', 'pause', 'uninstall', 'upgrade', 'edit', 'logs', 'view'];
    const userPaths = ['card', 'updates', 'hide', 'reset', 'alert'];
    if (userAction.includes(action)) {
        let permission = await Permission.findOne({ where: { containerName: trigger, user: user }, attributes: [`${action}`] });
        if (permission) { 
            if (permission[action] == true) {
                console.log(`User ${user} has permission to ${action} ${trigger}`);
                next();
                return;
            }
            else {
                console.log(`User ${user} does not have permission to ${action} ${trigger}`);
            }
        }
    } else if (userPaths.includes(action)) {
        next();
        return;
    }
}

// Utils
router.post("/install", adminOnly, Install);
router.post("/uninstall", adminOnly, Uninstall);

// Routes
router.get("/login", Login);
router.post("/login", submitLogin);
router.get("/logout", Logout);
router.get("/register", Register);
router.post("/register", submitRegister);  

router.get("/", sessionCheck, Dashboard);
router.get("/dashboard", sessionCheck, Dashboard);
router.post("/dashboard/:action", sessionCheck, permissionCheck, DashboardAction);
router.get("/sse", sessionCheck, SSE);
router.post("/updatePermissions", adminOnly, UpdatePermissions);
router.get("/stats", sessionCheck, Stats);
router.get("/chart", sessionCheck, Chart);

router.get("/images", adminOnly, Images);
router.post("/images/:action", adminOnly, Images);

router.get("/volumes", adminOnly, Volumes);
router.post("/addVolume", adminOnly, addVolume);
router.post("/removeVolume", adminOnly, removeVolume);

router.get("/networks", adminOnly, Networks);
router.post("/removeNetwork", adminOnly, removeNetwork);

router.get("/apps/:page?/:template?", adminOnly, Apps);
router.post("/apps", adminOnly, appSearch);
router.get("/remove_template/:template", adminOnly, removeTemplate);

router.get("/install_modal", adminOnly, InstallModal)
router.get("/import_modal", adminOnly, ImportModal)
router.get("/learn_more", adminOnly, LearnMore)
router.post("/upload", adminOnly, Upload);

router.get("/users", adminOnly, Users);
router.get("/syslogs", adminOnly, Syslogs);

router.get("/variables", adminOnly, Variables);

router.get("/settings", adminOnly, Settings);
router.post("/settings", adminOnly, updateSettings);

router.get("/account", sessionCheck, Account);
router.get("/supporters", sessionCheck, Supporters);
router.post("/thank", sessionCheck, Thanks);

