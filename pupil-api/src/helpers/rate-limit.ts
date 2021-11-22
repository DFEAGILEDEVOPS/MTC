import * as RateLimit from 'ioredis-ratelimit'
import * as Redis from 'ioredis'
import config from '../config'

const options: Redis.RedisOptions = {
  port: Number(config.Redis.Port),
  host: config.Redis.Host
}
if (config.Redis.Key !== undefined) {
  options.password = config.Redis.Key
}
if (config.Redis.useTLS) {
  options.tls = {
    host: config.Redis.Host
  }
}

const rateLimit = RateLimit({
  client: new Redis(options),
  key: (req: any) => {
    return `ratelimit::${req.ip}`
  },

  // Duration is in millseconds. see config.ts for defaults
  limit: config.RateLimit.Threshold,
  duration: config.RateLimit.Duration,

  // It's okay to have 0ms between requests
  difference: 0,

  // the redis key will last for 1 day
  ttl: 86400000
})

export { rateLimit }
