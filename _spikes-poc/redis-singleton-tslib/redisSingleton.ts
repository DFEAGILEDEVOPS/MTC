import Redis, { RedisOptions } from 'ioredis'
import config from './config'

class RedisSingleton {
  private static redisService: Redis.Redis

  private constructor (){

  }

  private static options: RedisOptions = {
    port: Number(config.Redis.Port),
    host: config.Redis.Host,
    password: config.Redis.Key,
    lazyConnect: true,
    tls: {
      host: config.Redis.useTLS ? config.Redis.Host : null
    }
  }

  public static async getRedisService (): Promise<Redis.Redis> {
    if (this.redisService == undefined) {
      console.log(`redis not yet connected. connecting...`)
      this.redisService = new Redis(this.options)
      try {
        await this.redisService.connect()
        console.log(`redis now connected to ${this.options.host}`)
      } catch (error) {
        // TODO deal with it, big problem!
        console.error(error)
        throw error
      }
    } else {
      console.log('redis already connected. returning...')
    }
    return this.redisService
  }

}