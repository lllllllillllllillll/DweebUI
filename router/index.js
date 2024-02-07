import express from "express";
export const router = express.Router();

// Controllers
import { Login, submitLogin, Logout } from "../controllers/login.js";
import { Register, submitRegister } from "../controllers/register.js";
import { Dashboard, searchDashboard } from "../controllers/dashboard.js";
import { Apps, appSearch } from "../controllers/apps.js";
import { Users } from "../controllers/users.js";
import { Images, removeImage } from "../controllers/images.js";
import { Networks, removeNetwork } from "../controllers/networks.js";
import { Volumes, removeVolume } from "../controllers/volumes.js";
import { Account } from "../controllers/account.js";
import { Settings } from "../controllers/settings.js";
import { Supporters } from "../controllers/supporters.js";
import { Syslogs } from "../controllers/syslogs.js";
import { Portal } from "../controllers/portal.js"

// Auth middleware
const auth = (req, res, next) => {
    if (req.session.role == "admin") {
        next();
    } else {
        res.redirect("/login");
    }
};

// Routes
router.get("/login", Login);
router.post("/login", submitLogin);
router.get("/logout", Logout);

router.get("/register", Register);
router.post("/register", submitRegister);  

router.get("/", auth, Dashboard);
router.post("/", auth, searchDashboard);

router.get("/images", auth, Images);
router.post("/removeImage", removeImage);

router.get("/volumes", auth, Volumes);
router.post("/removeVolume", removeVolume);

router.get("/networks", auth, Networks);
router.post("/removeNetwork", removeNetwork);

router.get("/portal", Portal)

router.get("/apps", auth, Apps);
router.get("/apps/:page", auth, Apps);
router.post("/apps", auth, appSearch);

router.get("/users", auth, Users);
router.get("/syslogs", auth, Syslogs);

router.get("/account", Account);
router.get("/settings", auth, Settings);
router.get("/supporters", Supporters);


// Functions
import { Install } from "../functions/install.js"
import { Uninstall } from "../functions/uninstall.js"

router.post("/install", auth, Install);
router.post("/uninstall", auth, Uninstall);