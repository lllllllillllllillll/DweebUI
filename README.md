# DweebUI


DweebUI is a simple docker web interface created using Node.js. 

Pre-Pre-Pre-Pre-Pre Alpha v 0.01 ( :fire: Experimental. Don't install on any servers you care about :fire: )

* I haven't used Github very much, and I'm still new to Javascript
* This is the first project I've ever released, and I'm sure it's full of plenty of bugs and mistakes.
* I probably should have waited a lot longer to share this :|

Requirements: Fresh Install of Debian 12.2

## Features

* Dashboard provides server metrics (cpu, ram, network, disk) and container controls on a single page.
* Partial Portainer Template Support (Network Mode, Ports, Volumes, Enviroment Variables, Labels, Commands, Restart Policy, Nvidia Hardware Acceleration).
* Light/Dark Mode.
* Support for multiple users is built in (but unused).
* Caddy Proxy Manager
* Pure Javascript. No Typescript. No Frameworks.
* User data is stored in a sqlite database and uses browser sessions and a redis store for authentication.
* Templates.json maintains compatability with Portainer, so you can use the template without needing to use DweebUI.

## Setup

* Download and extract DweebUI.zip to a fresh Debian 12.2 Install
```
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
