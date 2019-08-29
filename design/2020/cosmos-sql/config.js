const config = {}

config.endpoint = process.env.COSMOS_ENDPOINT
config.key = process.env.COSMOS_KEY

config.database = {
  id: 'mtc'
}

config.container = {
  id: 'receivedCheck'
}

module.exports = config
