const express = require("express");
const router = express.Router();

const { Dashboard, AddSite, RemoveSite, RefreshSites, DisableSite, EnableSite } = require("../controllers/dashboard");
const { Login, processLogin, Logout, Register, processRegister } = require("../controllers/auth");
const { Apps, searchApps, Install, Uninstall } = require("../controllers/apps");

const { Images } = require("../controllers/images");
const { Volumes } = require("../controllers/volumes");
const { Networks } = require("../controllers/networks");

const { Users } = require("../controllers/users");
const { Account } = require("../controllers/account");
const { Settings } = require("../controllers/settings");

// Authentication middleware
const authenticate = (req, res, next) => {
    if (req.session && req.session.role == "admin") {
        console.log(`User ${req.session.user} [${req.session.role}] accessed ${req.originalUrl}`)
        next();
    } else {
        console.log('Not admin')
        res.redirect("/login");
    }
};

// Dashboard
router.get("/", authenticate, Dashboard);
router.post("/addsite", authenticate, AddSite);
router.post("/removesite", authenticate, RemoveSite);
router.get("/refreshsites", authenticate, RefreshSites);
router.post("/disablesite", authenticate, DisableSite);
router.post("/enablesite", authenticate, EnableSite);

router.get("/images", authenticate, Images);

// Auth
router.get("/login", Login);
router.post("/login", processLogin);
router.get("/register", Register);
router.post("/register", processRegister);
router.get("/logout", Logout);

// Apps page
router.get("/apps", authenticate, Apps);
router.get("/apps/:page", authenticate, Apps);
router.get("/apps/:template/:page", authenticate, Apps);
router.post("/apps", authenticate, searchApps);

// Settings page
router.get("/settings", authenticate, Settings);
router.get("/account", authenticate, Account);

router.post("/install", authenticate, Install);
router.post("/uninstall", authenticate, Uninstall);

router.get("/users", authenticate, Users);

module.exports = router;