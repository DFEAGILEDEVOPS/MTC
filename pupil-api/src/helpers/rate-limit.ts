import * as RateLimit from 'ioredis-ratelimit'
import * as Redis from 'ioredis'
import config from '../config'

const options: Redis.RedisOptions = {
  port: Number(config.Redis.Port),
  host: config.Redis.Host
}
if (config.Redis.Key) {
  options.password = config.Redis.Key
}
if (config.Redis.useTLS) {
  options.tls = {
    host: config.Redis.Host
  }
}

const rateLimit = RateLimit({
  client: new Redis(options),
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
