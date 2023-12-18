# DweebUI
DweebUI is a simple Docker web interface created using Javascript, Node.JS, and Express.

v0.09

[![GitHub Stars](https://img.shields.io/github/stars/lllllllillllllillll/DweebUI)](https://github.com/lllllllillllllillll)
[![GitHub Activity](https://img.shields.io/github/commit-activity/y/lllllllillllllillll/DweebUI)](https://github.com/lllllllillllllillll)
[![Docker Pulls](https://img.shields.io/docker/pulls/lllllllillllllillll/dweebui)](https://hub.docker.com/repository/docker/lllllllillllllillll/dweebui)
[![GitHub License](https://img.shields.io/github/license/lllllllillllllillll/DweebUI)](https://github.com/lllllllillllllillll/DweebUI/blob/main/LICENSE)


<a href="https://raw.githubusercontent.com//lllllllillllllillll/DweebUI/main/screenshots/dashboard.png"><img src="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/screenshots/dashboard.png" width="50%"/></a>

<a href="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/screenshots/apps.png"><img src="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/screenshots/apps.png" width="50%"/></a>


## Features
* [x] Dashboard provides server metrics, container metrics, and container controls, on a single page.
* [x] View container logs.
* [ ] Update containers (planned).
* [ ] Manage your Docker networks, images, and volumes (planned).
* [x] Light/Dark Mode.
* [x] Easy to install app templates.
* [x] Multi-User built-in.
* [ ] User pages (planned).
* [x] Support for Windows, Linux, and MacOS.
* [ ] Docker compose support (planned).
* [x] Templates.json maintains compatability with Portainer, allowing you to use the template without needing to use DweebUI.
* [x] Automatically persists data in docker volumes if bind mount isn't used.
* [ ] Preset variables (planned).
* [ ] Proxy manager for Caddy (Disabled).


## Setup

Docker Compose: 
```
version: "3.9"
services:

  dweebui:
    container_name: dweebui
    image: lllllllillllllillll/dweebui:v0.09-dev
    # build:
    #   context: .
    environment:
      NODE_ENV: production
      PORT: 8000
      SECRET: MrWiskers
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


## Credits

* Dockerode and dockerode-compose by Apocas: https://github.com/apocas/dockerode
* UI was built using HTML and CSS elements from https://tabler.io/
* Apps template based on Portainer template provided by Lissy93: https://github.com/Lissy93/portainer-templates
* Icons from Walkxcode with some renames and additions: https://github.com/walkxcode/dashboard-icons


## Supporters

* MM (Patreon)