<h3 align="center"><img width="150" src="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/public/images/logo.png"></h3>
<h4 align="center">DweebUI Beta v0.50 ( :fire: Experimental :fire: )</h4>
<h3 align="center">Free and Open-Source WebUI For Managing Your Containers.</h3>
<p align="center">
    <a href="#"><img src="https://img.shields.io/github/stars/lllllllillllllillll/DweebUI?style=flat"/></a>
    <a href="https://github.com/lllllllillllllillll"><img src="https://img.shields.io/github/commit-activity/y/lllllllillllllillll/DweebUI"/></a>
    <a href="#"><img src="https://img.shields.io/docker/pulls/lllllllillllllillll/dweebui"/></a>
    <a href="#"><img src="https://img.shields.io/github/languages/top/lllllllillllllillll/DweebUI"/></a>
    <a href="#"><img src="https://img.shields.io/github/license/lllllllillllllillll/DweebUI"/></a>
    <a href="https://www.reddit.com/r/dweebui"><img src="https://img.shields.io/badge/reddit-orange"/></a>
    <a href="https://www.buymeacoffee.com/lllllllillllllillll"><img src="https://img.shields.io/badge/-buy_me_a%C2%A0coffee-gray?logo=buy-me-a-coffee"/></a>
</p>
<h3 align="center"><img width="800" src="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/screenshots/dashboard1.png"></h3>


## About
* I started this as a personal project to get more familiar with Javascript and Node.js, so there may be some rough edges and spaghetti code.
* I'm open to any contributions but you may want to wait until I reach v1.0 first.
* Please post issues and discussions so I know what bugs and features to focus on.
* DweebUI is a management interface and should not be directly exposed to the internet

## Features
* [x] Dashboard provides server metrics, container metrics, and container controls, on a single page.
* [x] View container logs.
* [x] View container logs.
* [ ] Update containers (planned).
* [x] Manage your Docker networks, images, and volumes.
* [x] Light/Dark Mode.
* [x] Mobile Friendly.
* [x] Easy to install app templates.
* [x] Multi-User built-in.
* [ ] Permissions system (in development).
* [x] Support for Windows, Linux, and MacOS.
* [ ] Docker compose (in development).
* [x] Templates.json maintains compatability with Portainer, allowing you to use the template without needing to use DweebUI.
* [ ] Preset variables (planned).
* [ ] Themes (planned).


## Setup

Docker Compose: 
```
version: "3.9"
services:
  dweebui:
    container_name: dweebui
    image: lllllllillllllillll/dweebui:v0.50
    environment:
      PORT: 8000
      SECRET: MrWiskers
      HTTPS: false
    restart: unless-stopped
    ports:
      - 8000:8000
    volumes:
      - dweebui:/app
      # Docker socket
      - /var/run/docker.sock:/var/run/docker.sock
      # Podman socket
      #- /run/podman/podman.sock:/var/run/docker.sock

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
* PD (Buymeacoffee)