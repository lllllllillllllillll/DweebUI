const express = require("express");
const session = require("express-session");
const redis = require('connect-redis');
const app = express();
const routes = require("./routes");

const { serverStats, containerList, containerStats, containerAction } = require('./functions/system_information');

let sent_list, clicked;

const redisClient = require('redis').createClient({
    host:'localhost',
    port:6379,
    password:'somesupersecretpassword',
    legacyMode:true
});
redisClient.connect().catch(console.log);
const RedisStore = redis(session);

const sessionMiddleware = session({
    store:new RedisStore({client:redisClient}),
    secret: "keyboard cat", 
    resave: false, 
    saveUninitialized: false, 
    cookie:{
        secure:false, // Only set to true if you are using HTTPS.
        httpOnly:false, // Only set to true if you are using HTTPS.
        maxAge:3600000 * 8// Session max age in milliseconds. 3600000 = 1 hour.
    } 
})

app.set('view engine', 'ejs');
app.use([
    express.static("public"),
    express.json(),
    express.urlencoded({ extended: true }),
    sessionMiddleware,
    routes
]);

const server = app.listen(8000, async () => {
    console.log(`App listening on port 8000`);   
});

const io = require('socket.io')(server);
io.engine.use(sessionMiddleware);


io.on('connection', (socket) => {
    // set user session
    const user_session = socket.request.session;
    console.log(`${user_session.user} connected from ${socket.handshake.headers.host} ${socket.handshake.address}`);

    // check if a list of containers needs to be sent
    if (sent_list != null) { socket.emit('cards', sent_list); }

    // check if an install card has to be sent
    if((app.locals.install != '') && (app.locals.install != null)){ socket.emit('install', app.locals.install); }

    // send server metrics
    let ServerStats = setInterval(async () => {
        socket.emit('metrics', await serverStats());
    }, 1000);

    // send container list
    let ContainerList = setInterval(async () => {
        let card_list = await containerList();
        if (sent_list !== card_list) {
            sent_list = card_list;
            app.locals.install = '';
            socket.emit('cards', card_list);
        }
    }, 1000);

    // send container metrics
    let ContainerStats = setInterval(async () => {
        let container_stats = await containerStats();
        for (let i = 0; i < container_stats.length; i++) {
            socket.emit('container_stats', container_stats[i]);
        }
    }, 1000);

    // play/pause/stop/restart container
    socket.on('clicked', (data) => {
        if (clicked == true) { return; } clicked = true;
        let buttonPress = {
            user: socket.request.session.user,
            role: socket.request.session.role,
            action: data.action,
            container: data.container,
            state: data.state
        }
        containerAction(buttonPress);
        clicked = false;
    });
    
    socket.on('disconnect', () => {                
        clearInterval(ServerStats);
        clearInterval(ContainerList);
        clearInterval(ContainerStats);
    }); 

});