import express from 'express';
export const router = express.Router();

import { Login, submitLogin, Logout } from './controllers/login.js';
import { Register, submitRegister } from './controllers/register.js';
import { Dashboard, submitDashboard, ContainerAction, ServerMetrics, CardList, SSE } from './controllers/dashboard.js';
import { Settings, updateSettings } from './controllers/settings.js';
import { Images, submitImages } from './controllers/images.js';
import { Volumes, submitVolumes } from './controllers/volumes.js';
import { Networks, submitNetworks } from './controllers/networks.js';
import { Apps, submitApps } from './controllers/apps.js';
import { Users, submitUsers } from './controllers/users.js';
import { Syslogs } from './controllers/syslogs.js';
import { Account } from './controllers/account.js';
import { Preferences, submitPreferences } from './controllers/preferences.js';

import { sessionCheck, adminOnly, permissionCheck, permissionModal, updatePermissions } from './utils/permissions.js';

router.get('/login', Login);
router.post('/login', submitLogin);
router.get('/logout', Logout);
router.get('/register', Register);
router.post('/register', submitRegister);

router.get("/:host?/dashboard", sessionCheck, Dashboard);
router.get("/server_metrics", sessionCheck, ServerMetrics);

router.get("/permission_modal", adminOnly, permissionModal);
router.post("/update_permissions", adminOnly, updatePermissions);

router.get("/sse", sessionCheck, SSE);
router.get("/card_list", sessionCheck, CardList);

router.post("/:host?/container/:action/:containerid?", permissionCheck, ContainerAction);

router.get('/images', adminOnly, Images);
router.post('/images', adminOnly, submitImages);

router.get('/volumes', adminOnly, Volumes);
router.post('/volumes', adminOnly, submitVolumes);

router.get('/networks', adminOnly, Networks);
router.post('/networks', adminOnly, submitNetworks);

router.get("/apps/:page?/:template?", adminOnly, Apps);
router.post('/apps', adminOnly, submitApps);

router.get('/users', adminOnly, Users);
router.post('/users', adminOnly, submitUsers);

router.get('/syslogs', adminOnly, Syslogs);

router.get('/settings', adminOnly, Settings);
router.post('/settings', adminOnly, updateSettings);

router.get('/preferences', sessionCheck, Preferences);
router.post('/preferences', sessionCheck, submitPreferences);

router.get('/account', sessionCheck, Account);


// Search
router.post("/search", function (req, res) {
    // Check which page you're searching from
    let page = (req.header('hx-current-url')).split("/").pop();
    // Redirect to the controller
    switch(page) {
        case "dashboard":
            submitDashboard(req, res);
            break;
        case "images":
            submitImages(req, res);
            break;
        case "volumes":
            submitsubmitVolumes(req, res);
            break;
        case "networks":
            submitNetworks(req, res);
            break;
        case "apps":
            submitappSearch(req, res);
            break;
        default:
            res.send("Invalid search");
    }
});

router.get('*', (req, res) => {
    res.redirect('/dashboard');
});

