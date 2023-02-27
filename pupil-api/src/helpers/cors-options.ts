import config from '../config'
const whitelist = config.Cors.Whitelist.split(',')

const options = {
  origin: function (origin: string, callback: (error?: Error | null, flag?: boolean) => void) {
    if (whitelist.includes(origin) || origin === undefined) {
      callback(null, true)
    } else {
      callback(new Error(`CORS policy does not allow ${origin}`))
    }
  }
}

module.exports = options
