## v0.05 ( dev )
* Environment Variables and Labels are now unchecked by default.
* Support for Docker volumes.
* Fixed app uninstall.
* Fixed Proxy Manager.
* Updated functions to ignore the three DweebUI containers: DweebUI, DweebCache(redis), and DweebProxy(caddy).
* Visual updates: Tabs for networks, images, and volumes. Added 'update' option in container drop-down.
* Updated main.js to prevent javascript errors.
* Fix for templates using 'set' instead of 'default' in environment variables.
* Fixes for templates with no volumes or no labels.
* New README.md.
* New screenshots.
* Automatically persists data in docker volumes if there is no bind mount.

## v0.04 (Nov 11th 2023)
* Docker Image and Compose file available.
* The containers DweebUI and DweebCache are hidden from the dashboard.
* Default icon for containers.
* Fixed missing information in container details/edit modals (Ports, Env, Volumes, Labels).

## v0.03 (Nov 5th 2023)
* Container graphs now load instantly on refresh
* Working net data for server dashboard
* Redis is now installed as a docker container.


## v0.02 (Nov 1st 2023)
* Significant code clean-up and improvements
* CPU and RAM graphs for each container
* Updated Templates.json
* Fixed text color of VPN and VNC buttons


## v0.01 (Oct 15th 2023)
* First release. Not much working.
