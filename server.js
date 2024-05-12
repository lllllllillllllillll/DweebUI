import express from 'express';
import session from 'express-session';
import memorystore from 'memorystore';
import ejs from 'ejs';
import Docker from 'dockerode';
import { router } from './router/index.js';
import { sequelize } from './database/models.js';
export const docker = new Docker();

const app = express();
const MemoryStore = memorystore(session);
const PORT = process.env.PORT || 8000;

// Session middleware
const sessionMiddleware = session({
    store: new MemoryStore({ checkPeriod: 86400000 }), // Prune expired entries every 24h
    secret: "keyboard cat", 
    resave: false, 
    saveUninitialized: false, 
    cookie:{
        secure: false, 
        httpOnly: false,
        maxAge: 3600000 * 8 // Session max age in milliseconds. 3600000 = 1 hour.
    }
});

// Express middleware
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);
app.use([
    express.static('public'),
    express.urlencoded({ extended: true }),
    sessionMiddleware,
    router
]);

// Initialize server
app.listen(PORT, async () => {
    async function init() {// I made sure the console.logs and emojis lined up
        try { await sequelize.authenticate().then(
            () => { console.log('DB Connection: ✔️') }); }
            catch { console.log('DB Connection: ❌'); }
        try { await sequelize.sync().then(
            () => { console.log('Synced Models: ✔️') }); }
            catch { console.log('Synced Models: ❌'); } }
        await init().then(() => { 
            console.log(`Listening on http://localhost:${PORT}`);
    });
});