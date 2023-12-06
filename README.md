# DweebUI
DweebUI is a simple Docker web interface created with javascript and node.js

Pre-Pre-Pre-Pre-Pre Alpha v0.06 ( :fire: Experimental. Don't install on any servers you care about :fire: )

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
* [x] Proxy manager for Caddy. (Optional)
* [x] Partial Portainer Template Support (Network Mode, Ports, Volumes, Enviroment Variables, Labels, Commands, Restart Policy, Nvidia Hardware Acceleration).
* [x] Multi-User built-in.
* [ ] User pages: Shortcuts, Requests, Support. (planned)
* [x] Support for Windows, Linux, and MacOS.
* [ ] Import compose files. (planned)
* [x] Pure javascript. No frameworks or typescript.
* [x] Templates.json maintains compatability with Portainer, allowing you to use the template without needing to use DweebUI.
* [ ] Manage your Docker networks, images, and volumes. (planned)
* [ ] Preset variables. (planned)
* [ ] VPN, VPS, and Firewall Toggles. (planned)
* [ ] Offline Mode. (planned)

## Setup

* Docker Compose: 
```
version: "3.9"
services:

  dweebui:
    container_name: dweebui
    image: lllllllillllllillll/dweebui:v0.06
    environment:
      NODE_ENV: production
      REDIS_PASS: replace_with_password_for_redis
      # Proxy_Manager: enabled
    restart: unless-stopped
    ports:
      - 8000:8000
    depends_on:
      - cache
    links:
      - cache
    volumes:
      - ./data/app:/app
      - ./data/caddyfiles:/app/caddyfiles
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - dweeb_main_network
      
  dweeb-redis:
    container_name: dweeb-redis
    image: redis:6.2-alpine
    restart: unless-stopped
    command: redis-server --save 20 1 --loglevel warning --requirepass replace_with_password_for_redis
    volumes: 
      - ./data/redis:/data
    networks:
      - dweeb_main_network

networks:
  dweeb_main_network:
    driver: bridge
```

In order to use the compose file create a folder named somethign like ```dweebui``` and add the contents of above to a file named ```docker-compose.yml```. Also make sure to create a ```data``` folder for the dweeb files to be storred in.

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
