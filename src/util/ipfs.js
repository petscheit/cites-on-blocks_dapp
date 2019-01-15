const ipfsAPI = require('ipfs-http-client')
const ipfs = ipfsAPI('0.0.0.0', '5001')
const fileReaderPullStream = require('pull-file-reader')

export function add(file) {
    const fileStream = fileReaderPullStream(file)
    ipfs
        .add(fileStream)
        .then(response => {
            console.log(response)
            let ipfsId = response[0].hash
            console.log(ipfsId)
        }).catch((err) => {
            console.log(err)
        })
};