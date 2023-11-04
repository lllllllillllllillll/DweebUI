#!/bin/bash

# To demo DweebUI, run this script on a fresh Debian 12.2 install. This script will open port 443/tcp for Reverse Proxy and 22/tcp for SSH.

# Manual Install:
# cd DweebUI
# chmod +x setup.sh
# sudo ./setup.sh

# Install dependencies
apt-get install -y curl unzip ufw gnupg ca-certificates lsb-release gpg

# Enable firewall
ufw allow ssh && ufw --force enable

# Opens port 443/tcp for Reverse Proxy
ufw allow https

# Install Docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Create docker network
docker network create -d bridge AppBridge 

# Create a redis docker container with persistent storage and a password
docker run -d --name DweebCache --restart unless-stopped -v /home/docker/redis:/data -p 6379:6379 redis redis-server --requirepass "somesupersecretpassword"


# Install redis
# curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
# echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
# apt-get update -y
# apt-get install -y redis
# systemctl enable --now redis-server

# Install nodejs
mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
NODE_MAJOR=20
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
sudo apt-get update
sudo apt-get install nodejs -y

npm i

# Prep for caddy
mkdir -p /home/docker/caddy/sites
echo "import sites/*" > /home/docker/caddy/Caddyfile.tmp
mv /home/docker/caddy/Caddyfile.tmp /home/docker/caddy/Caddyfile


# Install pm2 and start DweebUI
npm install pm2 -g
pm2 start app.js --name "dweebui"
pm2 log


# Creates a 'docker-compose' alias, since the command changed to 'docker compose' in Debian 11.
echo '#!/bin/sh
docker compose "$@"' > /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
