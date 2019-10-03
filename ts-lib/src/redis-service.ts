
export interface IRedisService {
  get (key: string): any
  setex (key: string, value: string, ttl: number): any
}
export class RedisService implements IRedisService {
  get (key: string) {
    throw new Error('Method not implemented.')
  }
  setex (key: string, value: string, ttl: number) {
    throw new Error('Method not implemented.')
  }
}
