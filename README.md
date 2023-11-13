# DweebUI


DweebUI is a simple Docker web interface created with javascript and node.js

Pre-Pre-Pre-Pre-Pre Alpha v 0.04 ( :fire: Experimental. Don't install on any servers you care about :fire: )

* I haven't used Github very much and I'm still new to javascript.
* This is the first project I've ever released and I'm sure it's full of plenty of bugs and mistakes.
* I probably should have waited a lot longer to share this :|

Requirements: Docker

![DweebUI](https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/DweebUI.png)

## Features

* Dashboard provides server metrics (cpu, ram, network, disk) and container controls on a single page.
* Partial Portainer Template Support (Network Mode, Ports, Volumes, Enviroment Variables, Labels, Commands, Restart Policy, Nvidia Hardware Acceleration).
* Light/Dark Mode.
* Support for multiple users is built in (but unused).
* ~~ Caddy Proxy Manager (very simple. proof of concept) ~~ Broken since moving to docker container.
* Pure javascript. No frameworks or typescript.
* User data is stored in a sqlite database and uses browser sessions and a redis store for authentication.
* Templates.json maintains compatability with Portainer, so you can use the template without needing to use DweebUI.

## Setup

* Docker compose.yaml: 
```
services:
  dweebui:
    container_name: DweebUI
    image: lllllllillllllillll/dweebui:v0.04
    ports:
      - 8000:8000
    depends_on:
      - cache
    links:
      - cache
    volumes:
      - dweebui:/app
      - /var/run/docker.sock:/var/run/docker.sock
  cache:
    container_name: DweebCache
    image: redis:6.2-alpine
    restart: always
    command: redis-server --save 20 1 --loglevel warning --requirepass eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81
    volumes: 
      - cache:/data
  
volumes:
  dweebui:
  cache:
```

* Using setup.sh: 
```
Extract DweebUI.zip and navigate to /DweebUI
cd DweebUI
chmod +x setup.sh
sudo ./setup.sh
```
Once setup is complete, I recommend installing Caddy first, then something like code-server. 
The template is very rough. 

## Credit

* UI was built using HTML and CSS elements from https://tabler.io/
* Apps template based on Portainer template provided by Lissy93 here: https://github.com/Lissy93/portainer-templates
* Most of the app icons were sourced from Walkxcode's dashboard icons here: https://github.com/walkxcode/dashboard-icons
