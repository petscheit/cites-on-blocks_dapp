const ipfsAPI = require('ipfs-http-client')
const ipfs = ipfsAPI('0.0.0.0', '5001')
const fileReaderPullStream = require('pull-file-reader')

export function add(file) {
    const fileStream = fileReaderPullStream(file)
    return ipfs
        .add(fileStream)
        .then(response => {
            console.log(response)
            return response[0].hash
        }).catch((err) => {
            console.log(err)
        })
};