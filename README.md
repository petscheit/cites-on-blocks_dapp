# CITES Blockchain Challenge - DApp
## Requirements
- NodeJS 5.0+ recommended
- Windows, Linux or MacOS X
## Installation
1. Install Truffle and Ganache CLI globally
```
npm install -g truffle
npm install -g ganache-cli
```
2. Clone repository and move into directory
```
git clone https://github.com/cites-on-blocks/cites-on-blocks_dapp
cd cites-on-blocks_dapp
```
3. Install dependencies
```
npm install
```

# Demo Mode

1. run ./launch-demo.sh and wait until everything is running (~1 min)
2. Open localhost:3000 for cites dapp and localhost:5001/webui for ipfs webui
3. Import Private Keys to metamask:

Controller: 0x04fb4507e72398b4e7461e717d999cbc7d91bb5da10ac0cf38b00446c2be696d
Germany-DE: 0xd00ee65656695144ec92bb620514deb2274558950d689d36f01fdc0c70ccbbb8
France-FR: 0x718576aac11bf97ba0fb936b2ef1b45cf9f069fe1a41ae21c7649985aa28dafe
Philippines-PH: 0xccf3d0764a62246769009edb163b5f56119faf043d958470cc3fcd39a0680dec
Romania-RO: 0xbe1b7bb71f5e8c8beebe15f2b7f804f1ae747daaf75da0c76920314c0c340cb9
Rwanda-RW: 0x6319245ae972d4e6ea7f0885f0ada2bb3ec3c88b82b1a09343da82835af529a0

## Know metamask issue
When ganache is restarted for any reason, metamask has to be disabled, reenabled and unlocked in chrome, otherwise it will throw errors/not work.


# Start DApp
1. Run the development blockchain. Passing in a blocktime is recommended to test things like loading indicators, etc.
```
ganache-cli -b 3 -s haha
```
2. Compile and migrate contracts to development blockchain
```
// if outside truffle console
truffle compile
truffle migrate

// if inside truffle console
compile
migrate
```
3. Run the front-end webpack server with hot reloading. Serves front-end on http://localhost:3000
```
npm run start
```
## Testing
1. Test smart contracts
```
// if outside truffle console
truffle test

// if inside truffle console
test
```
2. Test React components using Jest
```
npm run test
```
## Build
1. Build application for producation in build_webpack folder
```
npm run build
```