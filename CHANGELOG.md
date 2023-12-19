## v0.09 (dev)
* Added authentication middleware to router.
* Added gzip compression.
* Added PM2.
* Added Helmet.
* Fixed missing session data.
* Reduced sqlite queries.

## v0.08 (Dec 15th 2023)
* Updates to compose file and instructions from [steveiliop56](https://github.com/steveiliop56)
* Added SECRET field to compose file as a basic security measure.
* Visibility button to hide containers or reset view.
* Container link now uses server IP address.
* More compact container card, with style options planned.
* Improved log view.
* Removed VPN, Firewall, and VNC buttons.
* Updated dependencies (Sequelize 6.35.2)
* Fixed web pages not using the "public" static folder.
* Small tweaks to router.
* Replaced the default icon shown for missing icons (docker.png).

## v0.07 (Dec 8th 2023)
* View container logs.
* Removed Redis.
* Improved uninstall function and form id fix.
* WebUI Port can be changed in compose.yml
* Code clean-up.
* Updated dependencies (systeminformation).
  
## v0.06 (Nov 24th 2023)
* Multi-platform image (amd64/arm64).
* Removed Caddy from compose file.
* Proxy Manager UI can be enabled from environment variable.
* Removed hardcoded redis passwords.
* Repo change: Implemented image build-and-publish and dependabot (Thank you, gaby).
* Updated dependencies.

## v0.05 (Nov 17th 2023)
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
