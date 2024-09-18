## v0.70 (dev)
* Fixed installs having to be run twice.
* Updated systeminformation.
* Updated adm-zip.
* Updated yaml.
* Pushed new docker image with 'latest' tag.
* Fixed container card links.
* Moved 'Reset view' button.
* New - 'Grid view' and 'List view' button (non-functioning).
* Added try blocks to volumes, images, and networks pages to address GitHub issues.
* Fixed HTTPS env.
* New - Authentication can be reduced or disabled.
* New (again) - PM2 to keep the app running if it encounters an error.
* New - User registration enabled/disabled from Settings page.
* Removed 'SECRET' environment variable.
* New - Custom container_card ports links.
* New - Custom container_card title links.
* Fixed issue updating view permission.
* Fixed issue viewing container logs.
* App icons are now determined by service label instead of image name.
* App icons sourced from new repo with 1000+ icons.
* Rewrote most of the app to use containerIDs and UUIDs universally.
* Dashboard updates now triggered by Docker events instead of constantly polling the API.
* Sessions now stored in sqlite database instead of memory.
* Updated tabler from 1.0.0-beta16 to 1.0.0-beta20.
* Updated htmx (2.0.1) and sse plugin (2.2.1).
* Seperated css and js customizations into dweebui.css and dweebui.js.
* New - Preferences page for individual user settings, like language choice.
* New - Hide username from dashboard.
* New - Footer displays version with build number.
* Updated hide container_card to be **instant**.
* Improved console.log and syslog messages.
* Fixed modal close buttons.
* Reduced amount of html being stored in js files.
* CSS and pages tweaks to make the style more consistent.
* Improved container cards to be more compact.
* Improved sponsors and credits pages.
* New - Secret supporter code.
* Fixed installs not appearing or appearing multiple times.
* Improved log view and fixed refresh button.
* Made app cards more compact.



## v0.60 (June 9th 2024) - Permissions system and import templates
* Converted JS template literals into HTML.
* Converted modals into HTML/HTMX.
* Moved functions into dashboard controller.
* New - Modal placeholder with loading spinner.
* Container cards now update independently.
* Container cards now display pending action (starting, stopping, pausing, restarting).
* User avatars are now automatically generated.
* Updated database models.
* New - Multi-user permission system.
* Refactored dashboard to support multiple users.
* New - Banner alerts.
* New - Template importing (*.yml, *.yaml, *.json).
* Improved app search.
* New - Search by category.
* Updated dependencies.
* Removed warning from the bottom of the registration page. Will be added back in a different location.
* New - admin checks, session checks, and permission checks for router. 
* Added titles to activity indicators.
* Created Github Wiki.
* Added image pull to images page.
* Images and volumes display 'In use'.
* Images display tag.
* Image pull gets latest if not set.
* Updated buttons to trigger from 'mousedown' (John Carmack + Theo told me to).
* Volumes page displays type (Volume or Bind).
* Volume button is now functional.

## v0.40 (Feb 26th 2024) - HTMX rewrite
* Pages rewritten to use HTMX.
* Removed Socket.io.
* Changed view files to *.HTML instead of *.EJS.
* Removed "USER root" from Dockerfile.
* Express sessions configured to use memorystore.
* Improved chart rendering.
* Improvements to container charts.
* Created Variables page.
* Created Supporters page.
* Ability to remove images, volumes, or networks.
* Fixed list.js sorting.
* Fixed apps.js page navigation.
* Removed stackfiles from templates.json and updated some icons.
* New logo.
* Improved handling of Docker events.
* Improved dashboard responsiveness.
* Updated server metrics styles.
* Container cards display pending action.
* Container charts only rendered if container running.
* Created permissions modal.
* Podman support (untested).
* Started a new template for FOSS apps.

## v0.20 (Jan 20th 2024) - The rewrite. Jumping all the way to v0.20.
* Changed to ES6 imports.
* Cleaned up file structure and code layout.
* Updated DweebUI logo.
* Visual tweaks to login and registration pages.
* Added .gitignore and .dockerignore files.
* Syslogs - View logs for sign-in and registration attempts. :new: 
* Docker socket now uses default connection.
* Updated Users page displays 'inactive' if no sign-ins within 30 days.
* Dashboard updates now triggered by Docker events.
* Massive reduction in the amount of HTML, CSS, and JS on client side.
* Container graphs are significantly more efficent and no longer use localStorage.
* Made dark mode the default theme.
* Created intervals to allow application to idle or scale with more users.
* Pages for images, volumes, and networks. :new: 
* Localized fonts.
* CORS.
* Testing with Mocha and Supertest.
* Created Portal page. :new:


## <del>v0.09 (dev)</del> dead. (It had so many problems that I essentially rewrote everything)
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
