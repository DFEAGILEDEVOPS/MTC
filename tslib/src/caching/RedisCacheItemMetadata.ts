export class RedisCacheItemMetadata {
  constructor (type: RedisItemDataType) {
    this.type = type
  }

  type: RedisItemDataType
}
export class RedisCacheItem {
  constructor (meta: RedisCacheItemMetadata, value: string) {
    this.meta = meta
    this.value = value
  }

  meta: RedisCacheItemMetadata
  value: string
}
export enum RedisItemDataType {
  string = 'string',
  number = 'number',
  object = 'object'
}
