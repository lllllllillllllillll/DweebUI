import express from 'express';
export const router = express.Router();

import { Login, submitLogin, Logout } from './controllers/login.js';
import { Register, submitRegister } from './controllers/register.js';
import { Dashboard, submitDashboard, ServerMetrics } from './controllers/dashboard.js';
import { Settings, submitSettings } from './controllers/settings.js';
import { Images, submitImages } from './controllers/images.js';
import { Volumes, submitVolumes } from './controllers/volumes.js';
import { Networks, submitNetworks } from './controllers/networks.js';
import { Users, submitUsers } from './controllers/users.js';
import { Apps, submitApps } from './controllers/apps.js';
import { Account } from './controllers/account.js';
import { containerAction } from './utils/docker.js';
import { Preferences, submitPreferences } from './controllers/preferences.js';


import { sessionCheck, adminOnly, permissionCheck } from './utils/permissions.js';

router.get('/login', Login);
router.post('/login', submitLogin);
router.get('/logout', Logout);
router.get('/register', Register);
router.post('/register', submitRegister);

router.get("/:host?/dashboard", sessionCheck, Dashboard);
router.get("/server_metrics", sessionCheck, ServerMetrics);

router.post("/:host?/container/:action", permissionCheck, containerAction);

router.get('/images', adminOnly, Images);
router.post('/images', adminOnly, submitImages);

router.get('/volumes', adminOnly, Volumes);
router.post('/volumes', adminOnly, submitVolumes);

router.get('/networks', adminOnly, Networks);
router.post('/networks', adminOnly, submitNetworks);

router.get('/settings', adminOnly, Settings);
router.post('/settings', adminOnly, submitSettings);

router.get("/apps/:page?/:template?", adminOnly, Apps);
router.post('/apps', adminOnly, submitApps);

router.get('/users', adminOnly, Users);
router.post('/users', adminOnly, submitUsers);

router.get('/preferences', sessionCheck, Preferences);
router.post('/preferences', sessionCheck, submitPreferences);

router.get('/account', sessionCheck, Account);


// Search
router.post("/search", function (req, res) {
    // Check which page your searching from
    let page = (req.header('hx-current-url')).split("/").pop();
    // Redirect to the controller
    switch(page) {
        case "dashboard":
            submitDashboard(req, res);
            break;
        case "images":
            Images(req, res);
            break;
        case "volumes":
            Volumes(req, res);
            break;
        case "networks":
            Networks(req, res);
            break;
        case "apps":
            appSearch(req, res);
            break;
        default:
            res.send("Invalid search");
    }
});



router.get('*', (req, res) => {
    res.redirect('/1/dashboard');
});

