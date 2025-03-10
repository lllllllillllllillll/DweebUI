import express from 'express';
export const router = express.Router();

import { Login, submitLogin, Logout } from './controllers/login.js';
import { Register, submitRegister } from './controllers/register.js';

import { Dashboard, searchDashboard, ServerMetrics, SSE, DashboardView, DashboardAction } from './controllers/dashboard.js';
import { Images, ImagesView, ImagesAction, searchImages } from './controllers/images.js';
import { Volumes, VolumesAction, searchVolumes } from './controllers/volumes.js';
import { Networks, NetworksAction, searchNetworks } from './controllers/networks.js';
import { Apps, AppsView, AppsAction, searchApps } from './controllers/apps.js';
import { Users, UsersView, UsersAction, searchUsers } from './controllers/users.js';
import { Syslogs, searchSyslogs } from './controllers/syslogs.js';
import { Account, searchAccount } from './controllers/account.js';
import { Preferences, submitPreferences, searchPreferences } from './controllers/preferences.js';
import { Settings, SettingsAction, SettingsView, updateLanguages, searchSettings } from './controllers/settings.js';
import { Sponsors, searchSponsors, SponsorsAction, SponsorsView } from './controllers/sponsors.js';
import { Credits } from './controllers/credits.js';

import { Install } from './utils/install.js';
import { Uninstall } from './utils/uninstall.js';

import { sessionCheck, adminOnly, permissionCheck } from './utils/permissions.js';

// DEBUGGING
// router.get('*', (req, res, next) => { console.log(`[GET] ${req.url}`); next(); });
// router.post('*', (req, res, next) => { console.log(`[POST] ${req.url}`); next(); });

router.get('/login', Login);
router.post('/login', submitLogin);
router.get('/logout', Logout);
router.get('/register', Register);
router.post('/register', submitRegister);

router.get("/", sessionCheck, Dashboard);

router.get("/dashboard", sessionCheck, Dashboard);
router.get("/dashboard/view/:view/:id?", sessionCheck, DashboardView);
router.post("/dashboard/action/:action/:id?", sessionCheck, DashboardAction);
router.get("/server_metrics", sessionCheck, ServerMetrics);
router.get("/sse", permissionCheck, SSE);

router.get("/images", adminOnly, Images);
router.get("/images/view/:view/:id?", adminOnly, ImagesView);
router.post("/images/action/:action/:id?", adminOnly, ImagesAction);

router.get("/volumes", adminOnly, Volumes);
router.post("/volumes/action/:action/:id?", adminOnly, VolumesAction);

router.get("/networks", adminOnly, Networks);
router.post('/networks/action/:action/:containerid?', adminOnly, NetworksAction);

router.get("/apps", adminOnly, Apps);
router.get("/apps/view/:view/:id?", adminOnly, AppsView);
router.post("/apps/action/:action/:id?", adminOnly, AppsAction);

router.get("/users", adminOnly, Users);
router.get("/users/view/:view/:id?", adminOnly, UsersView);
router.post("/users/action/:action/:id?", adminOnly, UsersAction);

router.get('/syslogs', adminOnly, Syslogs);

router.get('/settings', adminOnly, Settings);
router.get('/settings/view/:view/:id?', adminOnly, SettingsView);
router.post('/settings/action/:action?/:id?', adminOnly, SettingsAction);


router.get('/preferences', sessionCheck, Preferences);
router.post('/preferences', sessionCheck, submitPreferences);

router.get('/account', sessionCheck, Account);

router.get('/sponsors', sessionCheck, Sponsors);
router.get('/sponsors/view/:view/:id?', sessionCheck, SponsorsView);
router.post('/sponsors/action/:action/:id?', sessionCheck, SponsorsAction);

router.get('/credits', sessionCheck, Credits);


router.post("/install", adminOnly, Install);
router.post("/uninstall", adminOnly, Uninstall);

router.post('/update_languages', adminOnly, updateLanguages);


router.post("/switch_host", function (req, res) {
    req.session.host = req.body.host;
    console.log(`Switched to host ${req.session.host}`);
    res.redirect(req.get("Referrer") || "/")
});

router.post("/search", function (req, res) {
    // req.header('hx-current-url') == http://localhost:8000/dashboard
    let page = (req.header('hx-current-url')).split("/").pop();

    if (page == "dashboard") { searchDashboard(req, res); }
    else if (page == "images") { searchImages(req, res); }
    else if (page == "volumes") { searchVolumes(req, res); }
    else if (page == "networks") { searchNetworks(req, res); }
    else if (page == "apps") { searchApps(req, res); }
    else if (page == "users") { searchUsers(req, res); }
    else if (page == "syslogs") { searchSyslogs(req, res); }
    else if (page == "preferences") { searchPreferences(req, res); }
    else if (page == "settings") { searchSettings(req, res); }
    else if (page == "account") { searchAccount(req, res); }
    else if (page == "sponsors") { searchSponsors(req, res); }
    else {
        console.log(`[Search] ${req.body.search}`);
        res.send('ok');
    }
});