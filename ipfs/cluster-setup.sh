#!/bin/sh

# remove old data
docker-compose kill ipfs0 ipfs1 ipfs2 ipfs3 cluster0 cluster1 cluster2 cluster3
yes | docker-compose rm ipfs0 ipfs1 ipfs2 ipfs3 cluster0 cluster1 cluster2 cluster3
rm -rf compose/ipfs0
rm -rf compose/ipfs1
rm -rf compose/ipfs2
rm -rf compose/ipfs3
rm -rf compose/cluster0
rm -rf compose/cluster1
rm -rf compose/cluster2
rm -rf compose/cluster3

mkdir compose/ipfs0 compose/ipfs1 compose/ipfs2 compose/ipfs3 compose/cluster0 compose/cluster1 compose/cluster2 compose/cluster3
# generate swarm ID tokens for ipfs nodes
docker run --rm golang:1.9 sh -c 'go get github.com/Kubuxu/go-ipfs-swarm-key-gen/ipfs-swarm-key-gen && ipfs-swarm-key-gen' > swarm.key
cp swarm.key compose/ipfs0/swarm.key
cp swarm.key compose/ipfs1/swarm.key
cp swarm.key compose/ipfs2/swarm.key
cp swarm.key compose/ipfs3/swarm.key

cd compose/ipfs0
echo "Downloading webui files..."
curl https://ipfs.io/api/v0/get/QmSDgpiHco5yXdyVTfhKxr3aiJ82ynz8V14QcGKicM3rVh | tar -xf -
cd ../..

docker-compose up -d ipfs0
sleep 20
docker exec ipfs0 ipfs add -r data/ipfs/QmSDgpiHco5yXdyVTfhKxr3aiJ82ynz8V14QcGKicM3rVh
docker exec ipfs0 ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3000"]'
docker exec ipfs0 ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
docker exec ipfs0 ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'
docker exec ipfs0 ipfs config --json Gateway.Writable 'true'
docker stop ipfs0
sleep 10

docker-compose up