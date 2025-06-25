import express from 'express';
import ejs from 'ejs';
import { router } from './router.js';
import { sessionMiddleware } from './sys/db.js';
import { readFileSync } from 'fs';

const app = express();
const PORT = process.env.PORT || 8000;

let app_info = JSON.parse(readFileSync(`package.json`, 'utf8'));
console.log(`\x1b[33m DweebUI v${app_info.version}\n Author: ${app_info.author}\n License: ${app_info.license}\n Description: ${app_info.description}\x1b[0m`);
console.log('\x1b[31m * Breaking changes may require you to remove the DweebUI volume and start fresh. \n \x1b[0m');

app.set('view engine', 'html');
app.set('trust proxy', true);
app.engine('html', ejs.renderFile);
app.use([
    express.static('public'),
    express.urlencoded({ extended: true }),
    sessionMiddleware,
    router,
]);

app.listen(PORT, async () => {
    console.log(`\x1b[32mListening on http://localhost:${PORT}\x1b[0m`);
    console.log('');
});

// Error handling for uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (err, origin) => { console.error('Unhandled Exception:', err); });
process.on('unhandledRejection', (reason, promise) => { console.error('Unhandled Rejection:', reason); });