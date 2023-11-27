const express = require("express");
const router = express.Router();

const { Dashboard } = require("../controllers/dashboard");

const { AddSite, RemoveSite, RefreshSites, DisableSite, EnableSite } = require("../controllers/site_actions");

const { Apps, searchApps, Install, Uninstall } = require("../controllers/apps");
const { Users } = require("../controllers/users");
const { Account } = require("../controllers/account");
const { Settings } = require("../controllers/settings");
const { Logout } = require("../controllers/logout");
const { Login, processLogin } = require("../controllers/login");
const { Register, processRegister } = require("../controllers/register");



router.get("/", Dashboard);
router.post("/addsite", AddSite)
router.post("/removesite", RemoveSite)
router.get("/refreshsites", RefreshSites)
router.post("/disablesite", DisableSite)
router.post("/enablesite", EnableSite)


router.post("/install", Install)
router.post("/uninstall", Uninstall)



router.get("/users", Users);

router.get("/apps", Apps);
router.post("/apps", searchApps);

router.get("/settings", Settings);
router.get("/account", Account);

router.get("/login",Login); // Login page
router.post("/login",processLogin); // Process login

router.get("/register", Register); // Register page
router.post("/register",processRegister); // Process Register

router.get("/logout",Logout); // Logout

module.exports = router;