import express from "express";
export const router = express.Router();

// Controllers
import { Login, submitLogin, Logout } from "../controllers/login.js";
import { Register, submitRegister } from "../controllers/register.js";
import { Dashboard, searchDashboard } from "../controllers/dashboard.js";
import { Apps, appSearch } from "../controllers/apps.js";
import { Users } from "../controllers/users.js";
import { Images } from "../controllers/images.js";
import { Account } from "../controllers/account.js";
import { Settings } from "../controllers/settings.js";
import { Networks } from "../controllers/networks.js";
import { Volumes } from "../controllers/volumes.js";
import { Syslogs } from "../controllers/syslogs.js";
import { Portal } from "../controllers/portal.js"

/// Functions
import { Install } from "../functions/install.js"
import { Uninstall } from "../functions/uninstall.js"

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
router.get("/volumes", auth, Volumes);
router.get("/networks", auth, Networks);
router.get("/portal", Portal)

router.get("/apps", auth, Apps);
router.get("/apps/:page", auth, Apps);
router.post("/apps", auth, appSearch);

router.get("/users", auth, Users);
router.get("/syslogs", auth, Syslogs);


router.get("/account", Account);
router.get("/settings", auth, Settings);

// Functions
router.post("/install", auth, Install);
router.post("/uninstall", auth, Uninstall);
