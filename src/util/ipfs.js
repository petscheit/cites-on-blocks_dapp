const ipfsAPI = require('ipfs-http-client')
const ipfs = ipfsAPI('0.0.0.0', '5001')
const fileReaderPullStream = require('pull-file-reader')
const bs58 = require('bs58')



export function add(file) {
    const fileStream = fileReaderPullStream(file)
    return ipfs
        .add(fileStream)
        .then(response => {
            console.log(response)
            return buildMultihash(response[0].hash)
        }).catch((err) => {
            console.log(err)
        })
};

function buildMultihash(hash){
    const bytes = bs58.decode(hash)
    let versionHash = "0x" + bytes.toString('hex').substring(0, 4)
    let contentHash = "0x" + bytes.toString('hex').slice(4)
    decodeMultiHash(versionHash, contentHash)
    return [versionHash, contentHash]
}

export function decodeMultiHash(versionHash, contentHash){
    let concatedBytes = Buffer.from(versionHash.slice(2) + contentHash.slice(2), 'hex')
    let hash = bs58.encode(concatedBytes)
    return hash
}
