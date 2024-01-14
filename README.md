# DweebUI
DweebUI is a web interface for managing Docker, with a zero-config dashboard for your containers.

Alpha v0.20 ( :fire: Experimental :fire: )

:warning: DweebUI is a management interface and should not be directly exposed to the internet:warning:   
:warning: External access should be done through a VPN or secure SSH connection :warning:

[![GitHub Stars](https://img.shields.io/github/stars/lllllllillllllillll/DweebUI)](https://github.com/lllllllillllllillll)
[![GitHub Activity](https://img.shields.io/github/commit-activity/y/lllllllillllllillll/DweebUI)](https://github.com/lllllllillllllillll)
[![Docker Pulls](https://img.shields.io/docker/pulls/lllllllillllllillll/dweebui)](https://hub.docker.com/repository/docker/lllllllillllllillll/dweebui)
[![GitHub License](https://img.shields.io/github/license/lllllllillllllillll/DweebUI)](https://github.com/lllllllillllllillll/DweebUI/blob/main/LICENSE)

* This is a personal project I started to get more familiar with Javascript and Node.js.
* Some UI elements are placeholders.
* Please submit issues and post discussions so I know what features to focus on.
* I probably should have waited a lot longer to share this :|

<a href="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/screenshots/dashboard1.png"><img src="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/screenshots/dashboard1.png" width="25%"/></a>
<a href="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/screenshots/dashboard2.png"><img src="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/screenshots/dashboard2.png" width="25%"/></a>
<a href="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/screenshots/apps.png"><img src="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/screenshots/apps.png" width="25%"/></a>
<a href="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/screenshots/images.png"><img src="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/screenshots/images.png" width="25%"/></a>
<a href="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/screenshots/register.png"><img src="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/screenshots/register.png" width="25%"/></a>
<a href="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/screenshots/login.png"><img src="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/screenshots/login.png" width="25%"/></a>
<a href="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/screenshots/syslogs.png"><img src="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/screenshots/syslogs.png" width="25%"/></a>
<a href="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/screenshots/volumes.png"><img src="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/screenshots/volumes.png" width="25%"/></a>



## Features
* [x] Dashboard provides server metrics, container metrics, and container controls, on a single page.
* [x] View container logs.
* [ ] Update containers (planned).
* [ ] Manage your Docker networks, images, and volumes (in development).
* [x] Light/Dark Mode.
* [x] Easy to install app templates.
* [x] Multi-User built-in.
* [ ] Permissions system (in development).
* [x] Support for Windows, Linux, and MacOS.
* [ ] Docker compose import (in development).
* [x] Templates.json maintains compatability with Portainer, allowing you to use the template without needing to use DweebUI.
* [x] Automatically persists data in docker volumes if bind mount isn't used.
* [ ] Preset variables (planned).


## Setup

Docker Compose: 
```
version: "3.9"
services:
  dweebui:
    container_name: dweebui
    image: lllllllillllllillll/dweebui:v0.20-dev
    environment:
      NODE_ENV: production
      PORT: 8000
      SECRET: MrWiskers
    restart: unless-stopped
    ports:
      - 8000:8000
    volumes:
      - dweebui:/app
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - dweebui_net

volumes:
  dweebui:

networks:
  dweebui_net:
    driver: bridge
```

Compose setup:

* Paste the above content into a file named ```docker-compose.yml``` then place it in a folder named ```dweebui```.
* Open a terminal in the ```dweebui``` folder, then enter ```docker compose up -d```.
* You may need to use ```docker-compose up -d``` or execute the command as root with either ```sudo docker compose up -d``` or ```sudo docker-compose up -d```.



## Credits

* Dockerode and dockerode-compose by Apocas: https://github.com/apocas/dockerode
* UI was built using HTML and CSS elements from https://tabler.io/
* Apps template based on Portainer template provided by Lissy93: https://github.com/Lissy93/portainer-templates
* Icons from Walkxcode with some renames and additions: https://github.com/walkxcode/dashboard-icons


## Supporters

* MM (Patreon)