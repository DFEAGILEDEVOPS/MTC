import config from '../config.js'
import type { CorsOptions } from 'cors'

const whitelist = config.Cors.Whitelist.split(',')

const options: CorsOptions = {
  origin: function (origin: string | undefined, callback: (error: Error | null, flag?: boolean) => void) {
    if (origin === undefined || whitelist.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS policy does not allow ${origin}`))
    }
  }
}

export default options
