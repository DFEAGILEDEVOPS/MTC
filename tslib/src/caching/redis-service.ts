export interface IRedisService {
  get (key: string): Promise<any>
  setex (key: string, value: string, ttl: number): Promise<any>
}
export class RedisService implements IRedisService {
  async get (key: string) {
    throw new Error('Method not implemented.')
  }
  async setex (key: string, value: string, ttl: number) {
    throw new Error('Method not implemented.')
  }
}
