import * as redis from 'ioredis'

export interface IRedisService {
  get (key: string): Promise<any>
  setex (key: string, value: string, ttl: number): Promise<any>
  connect (): void
}
export class RedisService implements IRedisService {
  connect (): void {
    throw new Error('Method not implemented.')
  }
  async get (key: string) {
    throw new Error('Method not implemented.')
  }
  async setex (key: string, value: string, ttl: number) {
    throw new Error('Method not implemented.')
  }
}
