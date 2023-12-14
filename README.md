# DweebUI
DweebUI is a simple Docker web interface created with javascript and node.js

Pre-Pre-Pre-Pre-Pre Alpha v0.08 ( :fire: Experimental. Don't install on any servers you care about :fire: )

[![GitHub Stars](https://img.shields.io/github/stars/lllllllillllllillll/DweebUI)](https://github.com/lllllllillllllillll)
[![GitHub License](https://img.shields.io/github/license/lllllllillllllillll/DweebUI)](https://github.com/lllllllillllllillll/DweebUI/blob/main/LICENSE)
[![GitHub Activity](https://img.shields.io/github/commit-activity/y/lllllllillllllillll/DweebUI)](https://github.com/lllllllillllllillll)
[![Docker Pulls](https://img.shields.io/docker/pulls/lllllllillllllillll/dweebui)](https://hub.docker.com/repository/docker/lllllllillllllillll/dweebui)


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

Docker Compose: 
```
version: "3.9"
services:

  dweebui:
    container_name: dweebui
    image: lllllllillllllillll/dweebui:v0.08-dev
    # build:
    #   context: .
    environment:
      NODE_ENV: production
      PORT: 8000
      SECRET: MrWiskers
      #Proxy_Manager: enabled
    restart: unless-stopped
    ports:
      - 8000:8000
    volumes:
      - dweebui:/app
      - caddyfiles:/app/caddyfiles
      - /var/run/docker.sock:/var/run/docker.sock
      #- ./custom-templates.json:/app/custom-templates.json
      #- ./composefiles:/app/composefiles
    networks:
      - dweeb_network


volumes:
  dweebui:
  caddyfiles:


networks:
  dweeb_network:
    driver: bridge
```

Compose setup:

* Paste the above content into a file named ```docker-compose.yml``` then place it in a folder named ```dweebui```.
* Open a terminal in the ```dweebui``` folder, then enter ```docker compose up -d```.
* You may need to use ```docker-compose up -d``` or execute the command as root with either ```sudo docker compose up -d``` or ```sudo docker-compose up -d```.


Using setup.sh: 
```
Extract DweebUI.zip and navigate to /DweebUI
cd DweebUI
chmod +x setup.sh
sudo ./setup.sh
```


## Credit

* UI was built using HTML and CSS elements from https://tabler.io/
* Apps template based on Portainer template provided by Lissy93: https://github.com/Lissy93/portainer-templates
* Icons from Walkxcode with some renames and additions: https://github.com/walkxcode/dashboard-icons