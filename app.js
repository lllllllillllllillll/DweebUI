const express = require("express");
const session = require("express-session");
const redis = require('connect-redis');
const { currentLoad, mem, networkStats, fsSize, dockerContainerStats } = require('systeminformation');
const app = express();
const routes = require("./routes");
const PORT = 8000;
var Docker = require('dockerode');
var docker = new Docker({ socketPath: '/var/run/docker.sock' });
const { dashCard } = require('./components/dashCard');

let DockerContainers, sent_list, clicked, open_ports, ServerMetrics, card_list, external_port, internal_port;

const redisClient = require('redis').createClient({
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

const server = app.listen(PORT, async () => {
    console.log(`App listening on port ${PORT}`);   
});

const io = require('socket.io')(server);
io.engine.use(sessionMiddleware);

io.on('connection', (socket) => {

    const user_session = socket.request.session;

    // display client connection info
    console.log(`${user_session.user} connected from ${socket.handshake.headers.host} ${socket.handshake.address} \n Active Sessions: ${io.engine.clientsCount}`);

    // send list of running docker containers if sent_list contains data
    if (sent_list != null) { socket.emit('cards', sent_list); }

    // check if an install is in progress
    if((app.locals.install != '') && (app.locals.install != null)){
        socket.emit('install', app.locals.install);
    }    

    // send server metrics to client
    async function Metrics() {
        Promise.all([currentLoad(), mem(), networkStats(), fsSize()]).then(([cpuUsage, ramUsage, netUsage, diskUsage]) => {
            let cpu = Math.round(cpuUsage.currentLoad);
            let ram = Math.round(((ramUsage.active / ramUsage.total) * 100));
            let tx = netUsage[0].tx_bytes;
            let rx = netUsage[0].rx_bytes;
            let disk = diskUsage[0].use;
            socket.emit('metrics', { cpu, ram, tx, rx, disk });
        });
    }

    async function ContainersList() {
        card_list = '';
        open_ports = '';
        external_port;
        internal_port;

        docker.listContainers({ all: true }, async function (err, data) {
            for (const container of data) {
                
                let imageVersion = container.Image.split('/');
                let service = imageVersion[imageVersion.length - 1].split(":")[0];

                
                let containerId = docker.getContainer(container.Id);
                let containerInfo = await containerId.inspect();

                // console.log(containerInfo.Name.split('/')[1]);
                // console.log(container.Image);
                // console.log(containerInfo.HostConfig.RestartPolicy.Name);

                
                for (const [key, value] of Object.entries(containerInfo.HostConfig.PortBindings)) {
                    console.log(`${value[0].HostPort}:${key}`);
                    external_port = value[0].HostPort;
                    internal_port = key;

                    if (( external_port == undefined) || (internal_port == undefined)) {
                        external_port = 0;
                        internal_port = 0;
                    }
                }
                
                let volumes = [];

                console.log('Volumes:');
                for (const [key, value] of Object.entries(containerInfo.Mounts)) {
                    // console.log(`${value.Source}: ${value.Destination}: ${value.RW}`);
                    volumes.push(`${value.Source}: ${value.Destination}: ${value.RW}`);
                }

                console.log(volumes[0])
                console.log(volumes[1])
                console.log(volumes[2])


                // console.log('Environment Variables:');
                // for (const [key, value] of Object.entries(containerInfo.Config.Env)) {
                //     console.log(`${key}: ${value}`);
                // }

                // console.log('Labels:');
                // for (const [key, value] of Object.entries(containerInfo.Config.Labels)) {
                //     console.log(`${key}: ${value}`);
                // }

                // dockerContainerStats(container.Id).then((data) => {
                //     console.log(`${container.Names[0].slice(1)} // CPU: ${Math.round(data[0].cpuPercent)} // RAM: ${Math.round(data[0].memPercent)}`);
                // });
                
                let dockerCard = dashCard(container.Names[0].slice(1), service, container.Id, container.State, container.Image, external_port, internal_port);
                // open_ports += `-L ${external_port}:localhost:${external_port} `
                card_list += dockerCard;
            }

            // emit card list is it's different from what was sent last time, then clear install local
            if (sent_list !== card_list) {
                sent_list = card_list;
                app.locals.install = '';
                socket.emit('cards', card_list);
                console.log('Cards updated');
            }
        });
    }

    console.log('Starting Metrics');
    ServerMetrics = setInterval(Metrics, 1000);

    console.log('Starting Containers List');
    DockerContainers = setInterval(ContainersList, 1000);


    socket.on('clicked', (data) => {
        // Prevent multiple clicks
        if (clicked == true) { return; } clicked = true;

        console.log(`${socket.request.session.user} wants to: ${data.action} ${data.container}`);
    
        if (socket.request.session.role == 'admin') {
            var containerName = docker.getContainer(data.container);

            if ((data.action == 'start') && (data.state == 'stopped')) {
                containerName.start();
            } else if ((data.action == 'start') && (data.state == 'paused')) {
                containerName.unpause();
            } else if ((data.action == 'stop') && (data.state != 'stopped')) {
                containerName.stop();
            } else if ((data.action == 'pause') && (data.state == 'running')) {
                containerName.pause();
            } else if ((data.action == 'pause') && (data.state == 'paused')) {
                containerName.unpause();
            } else if (data.action == 'restart') {
                containerName.restart();
            }
        } else {
            console.log('User is not an admin');
        }
        clicked = false;
    });
    

    socket.on('disconnect', () => {
            console.log('Stopping Metrics');
            clearInterval(ServerMetrics);
            console.log('Stopping Containers List');
            clearInterval(DockerContainers);
    }); 

});