
#!/bin/sh

# remove old data
rm -rf ipfsA
rm -rf ipfsB
docker-compose kill ipfsA ipfsB
yes | docker-compose rm ipfsA ipfsB

#create new dirs
mkdir ipfsA ipfsB

# download webui files
cd ipfsA
echo "Downloading webui files..."
curl https://ipfs.io/api/v0/get/QmSDgpiHco5yXdyVTfhKxr3aiJ82ynz8V14QcGKicM3rVh | tar -xf -
cd ..

# generate swarm ID tokens
docker run --rm golang:1.9 sh -c 'go get github.com/Kubuxu/go-ipfs-swarm-key-gen/ipfs-swarm-key-gen && ipfs-swarm-key-gen' > swarm.key
cp swarm.key ipfsA/swarm.key
cp swarm.key ipfsB/swarm.key

#start containers
docker-compose up -d ipfsA ipfsB
echo "waiting for containers to be ready... (if error occurs here increase sleep time)"
sleep 20

# upload webui files to private ipfs network
docker exec ipfsA ipfs add -r data/ipfs/QmSDgpiHco5yXdyVTfhKxr3aiJ82ynz8V14QcGKicM3rVh
docker exec ipfsA ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3000", "*" ,"https://webui.ipfs.io"]'
docker exec ipfsA ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
docker exec ipfsA ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'
docker exec ipfsA ipfs config --json Gateway.Writable 'true'
docker restart ipfsA
sleep 10
echo ""
echo "Containers running and webui added to private network..."
echo "Opening webui..."
open http://127.0.0.1:5001/webui


# ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3000", "https://webui.ipfs.io"]'