import express from 'express';
import ejs from 'ejs';
import { router } from './router.js';
import { sessionMiddleware } from './database/config.js';

const app = express();
const PORT = process.env.PORT || 8000;

app.set('view engine', 'html');
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