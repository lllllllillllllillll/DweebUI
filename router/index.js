import express from "express";
export const router = express.Router();

// Controllers
import { Login, submitLogin, Logout } from "../controllers/login.js";
import { Register, submitRegister } from "../controllers/register.js";
import { Dashboard, searchDashboard, Start, Stop, Pause, Restart, Logs, Modal, Stats, Hide, Reset, Chart, Installing } from "../controllers/dashboard.js";
import { Apps, appSearch } from "../controllers/apps.js";
import { Users } from "../controllers/users.js";
import { Images, removeImage } from "../controllers/images.js";
import { Networks, removeNetwork } from "../controllers/networks.js";
import { Volumes, removeVolume } from "../controllers/volumes.js";
import { Account } from "../controllers/account.js";
import { Variables } from "../controllers/variables.js";
import { Settings } from "../controllers/settings.js";
import { Supporters, Thanks } from "../controllers/supporters.js";
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
router.get("/register", Register);
router.post("/register", submitRegister);  
router.get("/logout", Logout);

router.get("/", auth, Dashboard);
router.post("/start", auth, Start);
router.post("/stop", auth, Stop);
router.post("/pause", auth, Pause);
router.post("/restart", auth, Restart);
router.get("/logs", auth, Logs);
router.get ("/modal", auth, Modal);
router.get("/stats", auth, Stats);
router.post("/hide", auth, Hide);
router.post("/reset", auth, Reset);
router.get("/chart", auth, Chart);
router.get("/installing", auth, Installing);


router.get("/images", auth, Images);
router.post("/removeImage", removeImage);

router.get("/volumes", auth, Volumes);
router.post("/removeVolume", auth, removeVolume);

router.get("/networks", auth, Networks);
router.post("/removeNetwork", removeNetwork);

router.get("/portal", Portal)

router.get("/apps", auth, Apps);
router.get("/apps/:page", auth, Apps);
router.post("/apps", auth, appSearch);

router.get("/users", auth, Users);
router.get("/syslogs", auth, Syslogs);

router.get("/account", Account);
router.get("/variables", auth, Variables);
router.get("/settings", auth, Settings);

router.get("/supporters", Supporters);
router.post("/thank", Thanks);


// Functions
import { Install } from "../functions/install.js"
import { Uninstall } from "../functions/uninstall.js"

router.post("/install", auth, Install);
router.post("/uninstall", auth, Uninstall);