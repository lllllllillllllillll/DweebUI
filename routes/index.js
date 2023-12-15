const express = require("express");
const router = express.Router();

const { Dashboard, AddSite, RemoveSite, RefreshSites, DisableSite, EnableSite } = require("../controllers/dashboard");
const { Login, processLogin, Logout, Register, processRegister } = require("../controllers/auth");
const { Apps, searchApps, Install, Uninstall } = require("../controllers/apps");

const { Users } = require("../controllers/users");
const { Account } = require("../controllers/account");
const { Settings } = require("../controllers/settings");


// Dashboard
router.get("/", Dashboard);
router.post("/addsite", AddSite)
router.post("/removesite", RemoveSite)
router.get("/refreshsites", RefreshSites)
router.post("/disablesite", DisableSite)
router.post("/enablesite", EnableSite)

// Auth
router.get("/login",Login);
router.post("/login",processLogin);
router.get("/register", Register);
router.post("/register",processRegister);
router.get("/logout",Logout);

// Apps page
router.get("/apps", Apps);
router.get("/apps/:page", Apps);
router.get("/apps/:template/:page", Apps);
router.post("/apps", searchApps);



// Settings page
router.get("/settings", Settings);
router.get("/account", Account);



router.post("/install", Install)
router.post("/uninstall", Uninstall)

router.get("/users", Users);


module.exports = router;