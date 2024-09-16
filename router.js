import express from 'express';
export const router = express.Router();

import { Login, submitLogin, Logout } from './controllers/login.js';
import { Register, submitRegister } from './controllers/register.js';
import { Dashboard, searchDashboard, ContainerAction, ServerMetrics, SSE, CardList, UpdateCard } from './controllers/dashboard.js';
import { Images, submitImages, searchImages } from './controllers/images.js';
import { Volumes, submitVolumes, searchVolumes } from './controllers/volumes.js';
import { Networks, NetworkAction, searchNetworks } from './controllers/networks.js';
import { Apps, submitApps, searchApps } from './controllers/apps.js';
import { Users, submitUsers, searchUsers } from './controllers/users.js';
import { Syslogs, searchSyslogs } from './controllers/syslogs.js';
import { Account, searchAccount } from './controllers/account.js';
import { Preferences, submitPreferences, searchPreferences } from './controllers/preferences.js';
import { Settings, updateSettings, updateLanguages, searchSettings } from './controllers/settings.js';

import { Install } from './utils/install.js';
import { Uninstall } from './utils/uninstall.js';

import { Sponsors, searchSponsors } from './controllers/sponsors.js';

import { Credits } from './controllers/credits.js';

import { sessionCheck, adminOnly, permissionCheck, permissionModal, updatePermissions } from './utils/permissions.js';

router.get('/login', Login);
router.post('/login', submitLogin);
router.get('/logout', Logout);
router.get('/register', Register);
router.post('/register', submitRegister);

router.get("/", sessionCheck, Dashboard);
router.get("/:host?/dashboard", sessionCheck, Dashboard);
router.get("/server_metrics", sessionCheck, ServerMetrics);

router.get("/permission_modal", adminOnly, permissionModal);
router.post("/update_permissions", adminOnly, updatePermissions);

router.get("/sse", permissionCheck, SSE);
router.get("/card_list", permissionCheck, CardList);
router.get("/update_card/:containerid", permissionCheck, UpdateCard);

router.post("/:host?/container/:action/:containerid?", permissionCheck, ContainerAction);

router.get('/images', adminOnly, Images);
router.post('/images', adminOnly, submitImages);

router.get('/volumes', adminOnly, Volumes);
router.post('/volumes', adminOnly, submitVolumes);

router.get('/networks', adminOnly, Networks);
router.post('/:host?/network/:action/:containerid?', adminOnly, NetworkAction);

router.get("/apps/:page?/:template?", adminOnly, Apps);
router.post("/apps/:action?", adminOnly, submitApps);
router.post("/install", adminOnly, Install);
router.post("/uninstall", adminOnly, Uninstall);

router.get('/users', adminOnly, Users);
router.post('/users', adminOnly, submitUsers);

router.get('/syslogs', adminOnly, Syslogs);

router.get('/settings', adminOnly, Settings);
router.post('/settings', adminOnly, updateSettings);
router.post('/update_languages', adminOnly, updateLanguages);

router.get('/preferences', sessionCheck, Preferences);
router.post('/preferences', sessionCheck, submitPreferences);

router.get('/account', sessionCheck, Account);

router.get('/sponsors', sessionCheck, Sponsors);

router.get('/credits', sessionCheck, Credits);





router.post("/search", function (req, res) {
    // req.header('hx-current-url') == http://localhost:8000/dashboard
    let page = (req.header('hx-current-url')).split("/").pop();
    switch(page) {
        case "dashboard":
            searchDashboard(req, res);
            break;
        case "images":
            searchImages(req, res);
            break;
        case "volumes":
            searchVolumes(req, res);
            break;
        case "networks":
            searchNetworks(req, res);
            break;
        case "apps":
            searchApps(req, res);
            break;
        case "users":
            searchUsers(req, res);
            break;
        case "syslogs":
            searchSyslogs(req, res);
            break;
        case "preferences":
            searchPreferences(req, res);
            break;
        case "settings":
            searchSettings(req, res);
            break;
        case "account":
            searchAccount(req, res);
        case "sponsors":
            searchSponsors(req, res);
            break;
        default:
            console.log(`[Search] ${req.body.search}`);
            res.send('ok');
    }
});



// router.get('*', (req, res) => {
//     res.redirect('/dashboard');
// });

