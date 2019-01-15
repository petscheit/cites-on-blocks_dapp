# IPFS development script

Script for quickly setting up two ipfs private nodes running in seperate docker containers

### Setup

0. Install [docker](https://docs.docker.com/engine/installation/) and [docker-compose](https://docs.docker.com/compose/install/)
1. Run in `/ipfs` directory: `./dev-setup.sh`

### Access the [IPFS webui](https://github.com/ipfs-shipyard/ipfs-webui) dashboard.
A nice dashboard is already configured and connected with test nodes.
Find it at [http://127.0.0.1:5001](http://127.0.0.1:5001).

### Killing Docker containers
run `docker-compose kill ipfsA ipfsB && yes | docker-compose rm ipfsA ipfsB` to kill and remove all containers since they run in deamon mode