const PermitFactory = artifacts.require('PermitFactory')
const web3 = require('web3')
const ipfsAPI = require('ipfs-http-client')
const ipfs = ipfsAPI('ipfs0', '5001')
const bs58 = require('bs58')

module.exports = async (deployer, network, accounts) => {
  await deployer.deploy(PermitFactory)

  // set whitelist for dev purposes
  if (network === 'developpment') {
    const permitFactory = await PermitFactory.deployed()
    await permitFactory.addAddress(accounts[1], web3.utils.toHex('DE'))
    await permitFactory.addAddress(accounts[2], web3.utils.toHex('FR'))
  }

  if(network === 'demo'){    
    var argsDE = returnArgs("DE", "FR");
    var argsRW = returnArgs("RW", "RO");
    var argsPH = returnArgs("PH", "RW");
    var argsFR = returnArgs("FR", "DE");
    var argsRO = returnArgs("RO", "PH");
    var argsRWDE = returnArgs("RW", "DE")
    const permitFactory = await PermitFactory.deployed()
    await permitFactory.addAddress(accounts[1], web3.utils.toHex('DE'))
    await permitFactory.addAddress(accounts[2], web3.utils.toHex('FR'))
    await permitFactory.addAddress(accounts[3], web3.utils.toHex('PH'))
    await permitFactory.addAddress(accounts[4], web3.utils.toHex('RO'))
    await permitFactory.addAddress(accounts[5], web3.utils.toHex('RW'))
    let ipfsMultiHash0 = await add('0');
    let ipfsMultiHash1 = await add('1');
    let ipfsMultiHash2 = await add('2');
    await permitFactory.createPermitDemo(argsDE[0], argsDE[1], argsDE[2], argsDE[3], argsDE[4], argsDE[5], argsDE[6], argsDE[7], argsDE[8], argsDE[9], argsDE[10], ipfsMultiHash0[0], ipfsMultiHash0[1], {from: accounts[1]})
    await permitFactory.createPermitDemo(argsRW[0], argsRW[1], argsRW[2], argsRW[3], argsRW[4], argsRW[5], argsRW[6], argsRW[7], argsRW[8], argsRW[9], argsRW[10], ipfsMultiHash1[0], ipfsMultiHash1[1], { from: accounts[5] })
    await permitFactory.createPermitDemo(argsPH[0], argsPH[1], argsPH[2], argsPH[3], argsPH[4], argsPH[5], argsPH[6], argsPH[7], argsPH[8], argsPH[9], argsPH[10], ipfsMultiHash2[0], ipfsMultiHash2[1], { from: accounts[3] })
    await permitFactory.createPermitDemo(argsFR[0], argsFR[1], argsFR[2], argsFR[3], argsFR[4], argsFR[5], argsFR[6], argsFR[7], argsFR[8], argsFR[9], argsFR[10], ipfsMultiHash1[0], ipfsMultiHash1[1], { from: accounts[2] })
    await permitFactory.createPermitDemo(argsRO[0], argsRO[1], argsRO[2], argsRO[3], argsRO[4], argsRO[5], argsRO[6], argsRO[7], argsRO[8], argsRO[9], argsRO[10], ipfsMultiHash0[0], ipfsMultiHash0[1], { from: accounts[4] })
    await permitFactory.createPermitDemo(argsRWDE[0], argsRWDE[1], argsRWDE[2], argsRWDE[3], argsRWDE[4], argsRWDE[5], argsRWDE[6], argsRWDE[7], argsRWDE[8], argsRWDE[9], argsRWDE[10], ipfsMultiHash2[0], ipfsMultiHash2[1], { from: accounts[5] })
  }
}


function toHex(word){
  return web3.utils.stringToHex(word)
}

function returnArgs(from, to){
  return [toHex(from), toHex(to), 0, [toHex("Exporter"), toHex("Exporter street 1234"), toHex("Exporter City")],
  [toHex("Importer"), toHex("Importer street 1234"), toHex("Importer City")], [1234],
  [toHex("Axis calamianensis")], [toHex("Calamianes Deer")], [toHex("this is a description")], [web3.utils.asciiToHex()], [web3.utils.asciiToHex()]]
}
     
  async function add(num) {
    return ipfs
    .addFromFs('./cites' + num + '.jpg')
    .then(response => {
      return buildMultihash(response[0].hash)
    }).catch((err) => {
      console.log(err)
      throw err
    })
  };
  
  function buildMultihash(hash) {
    const bytes = bs58.decode(hash)
    let versionHash = "0x" + bytes.toString('hex').substring(0, 4)
    let contentHash = "0x" + bytes.toString('hex').slice(4)
    decodeMultiHash(versionHash, contentHash)
    return [versionHash, contentHash]
  }

  function decodeMultiHash(versionHash, contentHash) {
    let concatedBytes = Buffer.from(versionHash.slice(2) + contentHash.slice(2), 'hex')
    let hash = bs58.encode(concatedBytes)
    return hash
  }