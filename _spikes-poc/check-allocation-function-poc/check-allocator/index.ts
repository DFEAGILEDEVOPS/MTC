import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import * as Redis from 'handy-redis'
import checkTemplate from '../json/prepared-check.json'
import * as uuid from 'uuid'

const redisKeyPrefix = 'check:allocation:'
const schoolsToAllocate = 25000
const pupilsPerSchool = 50
const redisItemExpiryInSeconds = 3600 // 1 hour

class SchoolRecord {
  constructor (sasToken: string) {
    this.sasToken = sasToken
    this.pupils = new Array<object>()
    this.createdAt = new Date()
  }
  pupils: Array<object>
  createdAt: Date
  sasToken: string
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  // init redis
  const redis = Redis.createHandyClient({
    host: process.env.RedisHost,
    password: process.env.RedisKey,
    port: 6380,
    tls: process.env.RedisHost
  })
  // TODO generate SAS token(s)
  const sasToken = ''
  for (let schoolIdx = 0; schoolIdx < schoolsToAllocate; schoolIdx++) {
    context.log(`adding school ${schoolIdx}`)
    const schoolUUID = uuid.v4()
    const schoolItem = new SchoolRecord(sasToken)
    let pupilUUID
    const pupils = new Array()
    for (let pupilIdx = 0; pupilIdx < pupilsPerSchool; pupilIdx++) {
      pupilUUID = uuid.v4()
      pupils.push({
        id: pupilUUID,
        check: checkTemplate
      })
    }
    schoolItem.pupils = pupils
    await redis.setex(`${redisKeyPrefix}:${schoolUUID}:${pupilUUID}`, redisItemExpiryInSeconds, JSON.stringify(schoolItem))
  }
}

export default httpTrigger
