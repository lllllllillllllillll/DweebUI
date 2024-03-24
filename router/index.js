import express from "express";
import { Permission, User } from '../database/models.js';

export const router = express.Router();

// Controllers
import { Login, submitLogin, Logout } from "../controllers/login.js";
import { Register, submitRegister } from "../controllers/register.js";
import { Dashboard, Logs, Modals, Stats, Chart, SSE, Card, updateCards, Containers, Action, UpdatePermissions } from "../controllers/dashboard.js";
import { Apps, appSearch, InstallModal, ImportModal, LearnMore } from "../controllers/apps.js";
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
        res.redirect("/portal");
    }
};

// Admin routes
router.get("/", auth, Dashboard);
router.post("/action/:action", auth, Action);

router.get("/logs", auth, Logs);
router.get("/modals", auth, Modals);
router.get("/stats", auth, Stats);
router.get("/chart", auth, Chart);
router.get("/sse_event", auth, SSE);
router.get("/containers", auth, Containers);
router.get("/card", auth, Card);
router.get("/new_cards", auth, updateCards);
router.post("/updatePermissions", auth, UpdatePermissions);

router.get("/images", auth, Images);
router.post("/removeImage", auth, removeImage);

router.get("/volumes", auth, Volumes);
router.post("/removeVolume", auth, removeVolume);

router.get("/networks", auth, Networks);
router.post("/removeNetwork", auth, removeNetwork);

router.get("/apps", auth, Apps);
router.get("/apps/:page", auth, Apps);
router.post("/apps", auth, appSearch);
router.get("/install_modal", auth, InstallModal)
router.get("/import_modal", auth, ImportModal)
router.get("/learn_more", auth, LearnMore)

router.get("/users", auth, Users);
router.get("/syslogs", auth, Syslogs);

router.get("/variables", auth, Variables);
router.get("/settings", auth, Settings);

// User routes
router.get("/portal", Portal);
router.get("/account", Account);
router.get("/supporters", Supporters);
router.post("/thank", Thanks);

router.get("/login", Login);
router.post("/login", submitLogin);
router.get("/register", Register);
router.post("/register", submitRegister);  
router.get("/logout", Logout);


// Functions
import { Install } from "../functions/install.js"
import { Uninstall } from "../functions/uninstall.js"

router.post("/install", auth, Install);
router.post("/uninstall", auth, Uninstall);

