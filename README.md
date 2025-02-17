<h3 align="center"><img width="150" src="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/public/img/logo.png"></h3>
<h4 align="center">DweebUI v0.70 ( :fire: Experimental and Barely Tested :fire: )</h4>
<h3 align="center">Free and Open-Source WebUI For Managing Your Containers.</h3>
<p align="center">
    <a href=""><img src="https://img.shields.io/github/stars/lllllllillllllillll/DweebUI?style=flat"/></a>
    <a href="https://github.com/lllllllillllllillll/DweebUI%2Fdev"><img src="https://img.shields.io/github/commit-activity/y/lllllllillllllillll/DweebUI%2Fdev"/></a>
    <a href="https://github.com/lllllllillllllillll/DweebUI%2Fdev"><img src="https://img.shields.io/github/last-commit/lllllllillllllillll/DweebUI%2Fdev"/></a>
    <a href="https://hub.docker.com/r/lllllllillllllillll/dweebui"><img src="https://img.shields.io/docker/pulls/lllllllillllllillll/dweebui"/></a>
    <a href="https://github.com/lllllllillllllillll/DweebUI/blob/main/LICENSE"><img src="https://img.shields.io/github/license/lllllllillllllillll/DweebUI"/></a>
    <a href="https://www.reddit.com/r/dweebui"><img src="https://img.shields.io/badge/reddit-orange"/></a>
    <a href="https://www.buymeacoffee.com/lllllllillllllillll"><img src="https://img.shields.io/badge/-buy_me_a%C2%A0coffee-gray?logo=buy-me-a-coffee"/></a>
</p>
<h3 align="center"><img width="800" src="https://raw.githubusercontent.com/lllllllillllllillll/DweebUI/main/screenshots/dashboard1.png"></h3>

## Features

* [x] A dynamically updating dashboard that displays server metrics along with container metrics and container controls.
* [x] Container actions: Start, Stop, Pause, Restart, View Details, View Logs.
* [x] Multi-user support with permissions system.
* [x] Support for multiple hosts.
* [x] View and manage images, volumes, and networks.
* [x] Windows, Linux, and MacOS compatable.
* [x] Light/Dark Mode.
* [x] Mobile Friendly.
* [x] Easy to install app templates (Compatible with Portainer).
* [x] Docker Compose.
* [*] International language support (Languages still being updated).
* [ ] Update containers (planned).
* [ ] Preset variables (planned).
* [ ] Themes (planned).


## About

* DweebUI, short for Docker WebUI, is a free and open-source web interface for managing your containers.
* I started this as a personal project to learn more JavaScript/Node.js and the code may reflect that in some areas.
* There is no data collection or analytics, which means I have no idea how many people are using this.
* I'm open to any contributions, suggestions, and feedback.
* Please post issues and discussions so I know what bugs and features to focus on.
* DweebUI is a management interface and should not be directly exposed to the internet.

## Setup

### Quick Setup: 

Install the latest version of [Docker Desktop](https://www.docker.com/products/docker-desktop), then pull DweebUI or run the Docker Run command below.
Open your browser and go to ```http://localhost:8000```.

### Docker Run:
```
docker run -d --name=DweebUI -p 8000:8000 -v dweebui:/dweebui/data -v /var/run/docker.sock:/var/run/docker.sock lllllllillllllillll/dweebui:v0.70
```
Open your browser and go to ```http://localhost:8000```.

### Compose setup:

* Download ```compose.yaml``` and place it in a folder called ```dweebui```.
* Open a terminal in the ```dweebui``` folder, then enter ```docker compose up -d```.
* You may need to use ```docker-compose up -d``` or execute the command as root with either ```sudo docker compose up -d``` or ```sudo docker-compose up -d```.
* Open your browser and go to ```http://localhost:8000```.

[Troubleshooting](https://github.com/lllllllillllllillll/DweebUI/wiki/Troubleshooting)


## Credits

* Dockerode and dockerode-compose by Apocas: https://github.com/apocas/dockerode
* Interface was built using HTML and CSS elements from https://tabler.io/
* Apps template based on Portainer template by Lissy93: https://github.com/Lissy93/portainer-templates
* Icons from Walkxcode with renames, resizes, and additions: https://github.com/walkxcode/dashboard-icons
* Icons from Selfhst with renames, resizes, and additions: https://github.com/selfhst/icons


## Supporters

* MM (Patreon)
* Peter Dewit (Buymeacoffee)
* C (Patreon)
* AndyDufresne422 (Buymeacoffee)