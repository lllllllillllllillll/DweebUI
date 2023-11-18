# DweebUI
DweebUI is a simple Docker web interface created with javascript and node.js

Pre-Pre-Pre-Pre-Pre Alpha v0.05 ( :fire: Experimental. Don't install on any servers you care about :fire: )

[![GitHub Stars](https://img.shields.io/github/stars/lllllllillllllillll/DweebUI)](https://github.com/lllllllillllllillll)
[![GitHub License](https://img.shields.io/github/license/lllllllillllllillll/DweebUI)](https://github.com/lllllllillllllillll/DweebUI/blob/main/LICENSE)
[![GitHub Activity](https://img.shields.io/github/commit-activity/y/lllllllillllllillll/DweebUI)](https://github.com/lllllllillllllillll)

* I haven't used Github very much and I'm still new to javascript.
* This is the first project I've ever released and I'm sure it's full of plenty of bugs and mistakes.
* I probably should have waited a lot longer to share this :|

<a href="https://raw.githubusercontent.com//lllllllillllllillll/DweebUI/main/screenshots/dashboard.png"><img src="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/screenshots/dashboard.png" width="50%"/></a>

<a href="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/screenshots/apps.png"><img src="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/screenshots/apps.png" width="50%"/></a>


## Features
* [x] Dashboard provides server metrics (cpu, ram, network, disk) and container controls on a single page.
* [x] Light/Dark Mode.
* [x] Easy to install app templates.
* [x] Automatically persists data in docker volumes if bind mount isn't used. 
* [x] Proxy manager for Caddy.
* [x] Partial Portainer Template Support (Network Mode, Ports, Volumes, Enviroment Variables, Labels, Commands, Restart Policy, Nvidia Hardware Acceleration).
* [x] Multi-User built-in.
* [ ] User pages: Shortcuts, Requests, Support. (planned)
* [x] Support for Windows, Linux, and MacOS.
* [ ] Import compose files. (planned)
* [x] Pure javascript. No frameworks or typescript.
* [x] Templates.json maintains compatability with Portainer, allowing you to use the template without needing to use DweebUI.
* [ ] Manage your Docker networks, images, and volumes. (planned)
* [ ] Preset variables. (planned)


## Setup

* Docker compose.yaml: 
```
services:
  dweebui:
    container_name: DweebUI
    image: lllllllillllllillll/dweebui:v0.05
    restart: unless-stopped
    ports:
      - 8000:8000
    depends_on:
      - cache
    links:
      - cache
    volumes:
      - dweebui:/app
      - caddy:/app/caddyfiles
      - /var/run/docker.sock:/var/run/docker.sock
  cache:
    container_name: DweebCache
    image: redis:6.2-alpine
    restart: always
    command: redis-server --save 20 1 --loglevel warning --requirepass eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81
    volumes: 
      - cache:/data
  proxy:
    container_name: DweebProxy
    image: caddy:2.4.5-alpine
    depends_on:
      - dweebui
    restart: unless-stopped
    network_mode: host
    volumes:
      - caddy:/data
      - caddy:/config
      - caddy:/etc/caddy:ro
volumes:
  dweebui:
  cache:
  caddy:
```

* Using setup.sh: 
```
Extract DweebUI.zip and navigate to /DweebUI
cd DweebUI
chmod +x setup.sh
sudo ./setup.sh
```


## Credit

* UI was built using HTML and CSS elements from https://tabler.io/
* Apps template based on Portainer template provided by Lissy93 here: https://github.com/Lissy93/portainer-templates
* Most of the app icons were sourced from Walkxcode's dashboard icons here: https://github.com/walkxcode/dashboard-icons
