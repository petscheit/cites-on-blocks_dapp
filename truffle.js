module.exports = {
  migrations_directory: './migrations',
  networks: {
    development: {
      host: 'ganache',
      port: 8545,
      network_id: '*' // Match any network id
    },
    production: {
      host: '40.115.39.123',
      port: 8545,
      network_id: '*',
      // NOTE: unlocked account with a lot of ETH -> controller
      from: '0x6b0c56d1ad5144b4d37fa6e27dc9afd5c2435c3b',
      gas: '0x2FEFD8'
    }
  },
   compilers: {
    solc: {
      version: "0.4.23",
      optimizer: {
        enabled: true,
        runs: 500
      }
    }
  },
  mocha: {
    enableTimeouts: false
  }
}
