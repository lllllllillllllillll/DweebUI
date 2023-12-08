// Express
const express = require("express");
const app = express();
const session = require("express-session");
const PORT = process.env.PORT || 8000;

// Router
const routes = require("./routes");

// Functions and variables
const { serverStats, containerList, containerStats, containerAction, containerLogs } = require('./functions/system');
let sentList, clicked;
app.locals.site_list = '';

// Configure Session
const sessionMiddleware = session({
    secret: "keyboard cat", 
    resave: false, 
    saveUninitialized: false, 
    cookie:{
        secure:false, // Only set to true if you are using HTTPS.
        httpOnly:false, // Only set to true if you are using HTTPS.
        maxAge:3600000 * 8 // Session max age in milliseconds. 3600000 = 1 hour.
    } 
})

// Middleware
app.set('view engine', 'ejs');
app.use([
    express.static("public"),
    express.json(),
    express.urlencoded({ extended: true }),
    sessionMiddleware,
    routes
]);

// Start Express server
const server = app.listen(PORT, async () => {
    console.log(`App listening on port ${PORT}`);   
});

// Start Socket.io
const io = require('socket.io')(server);
io.engine.use(sessionMiddleware);

io.on('connection', (socket) => {

    // Set user session
    const user_session = socket.request.session;
    console.log(`${user_session.user} connected from ${socket.handshake.headers.host} ${socket.handshake.address}`);

    // Check if a list of containers or an install card needs to be sent
    if (sentList != null) { socket.emit('cards', sentList); }
    if((app.locals.install != '') && (app.locals.install != null)){ socket.emit('install', app.locals.install); }

    // Send server metrics
    let ServerStats = setInterval(async () => {
        socket.emit('metrics', await serverStats());
    }, 1000);

    // Send list of containers
    let ContainerList = setInterval(async () => {
        let cardList = await containerList();
        if (sentList !== cardList) {
            sentList = cardList;
            app.locals.install = '';
            socket.emit('cards', cardList);
        }
    }, 1000);

    // Send container metrics
    let ContainerStats = setInterval(async () => {
        let stats = await containerStats();
        for (let i = 0; i < stats.length; i++) {
            socket.emit('containerStats', stats[i]);
        }
    }, 1000);

    // Container controls
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


    // Container logs
    socket.on('logs', (data) => {
        containerLogs(data.container)
        .then(logs => {
            socket.emit('logString', logs);
        })
        .catch(err => {
            console.error(err);
        });
    });

    // On disconnect
    socket.on('disconnect', () => {                
        clearInterval(ServerStats);
        clearInterval(ContainerList);
        clearInterval(ContainerStats);
    }); 

});