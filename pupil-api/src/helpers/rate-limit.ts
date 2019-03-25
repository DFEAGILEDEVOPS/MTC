import * as RateLimit from 'ioredis-ratelimit'
import * as Redis from 'ioredis'

import config from '../config'
const redisOptions = { tls: config.Redis.useTLS, password: null }
if (config.Redis.Key) {
  redisOptions.password = config.Redis.Key
}
const rateLimit = RateLimit({
  client: new Redis(config.Redis.Port, config.Redis.Host, redisOptions),
  key: (req) => {
    return 'ratelimit::' + req.ip
  },

  // 100 requests are allowed per 60s by default (Duration is in millseconds)
  limit: config.RateLimit.Threshold,
  duration: config.RateLimit.Duration,

  // It's okay to have 0ms between requests
  difference: 0,

  // the redis key will last for 1 day
  ttl: 86400000
})

export { rateLimit }
