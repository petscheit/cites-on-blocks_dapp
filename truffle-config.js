module.exports = {
  migrations_directory: './migrations',
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      network_id: '*' // Match any network id
    },
    demo: {
      host: 'ganache',
      port: 8545,
      network_id: '*' // Match any network id
    },
    production: {
      // TODO: replace with ip and port of azure instance
      host: 'localhost',
      port: 8545,
      network_id: '*',
      // NOTE: unlocked account with a lot of ETH -> controller
      from: '0x6b0c56d1ad5144b4d37fa6e27dc9afd5c2435c3b'
    }
  },
  compiler: {
    solc: {
      version: "0.4.24",
      optimizer: {
        enabled: true,
        runs: 500
      }
    }
  }
}
