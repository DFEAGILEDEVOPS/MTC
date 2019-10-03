import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import * as Redis from 'handy-redis'
import checkTemplate from '../json/example-prepared-check.json'
import * as uuid from 'uuid'
import { SasToken, SasTokenService } from '@mtclib/sas-token-service'
import Moment from 'moment'

const redisKeyPrefix = 'check:allocation:'
const schoolsToAllocate = 25000
const pupilsPerSchool = 50
const redisItemExpiryInSeconds = 3600 // 1 hour

class SchoolRecord {
  constructor (sasTokens: Array<SasToken>) {
    this.sasTokens = sasTokens
    this.pupils = new Array<object>()
    this.createdAt = new Date()
  }
  pupils: Array<object>
  createdAt: Date
  sasTokens: Array<SasToken>
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  // init redis
  const redis = Redis.createHandyClient({
    host: process.env.RedisHost,
    password: process.env.RedisKey,
    port: 6380,
    tls: process.env.RedisHost
  })

  const tokens = Array<SasToken>()
  const expireTokenAt = Moment().add(1, 'day')
  const sasTokenService = new SasTokenService()
  const queues = ['check-submitted', 'check-started', 'pupil-prefs', 'pupil-feedback']
  queues.forEach((q) => {
    const token = sasTokenService.generateSasToken(q, expireTokenAt)
    tokens.push(token)
  })

  // TODO load all pupils via SQL (schoolUUID(urlSlug), pupilUUID(urlSlug))
  for (let schoolIdx = 0; schoolIdx < schoolsToAllocate; schoolIdx++) {
    context.log(`adding school ${schoolIdx}`)
    const schoolUUID = uuid.v4()
    const schoolItem = new SchoolRecord(tokens)
    const pupils = new Array()
    for (let pupilIdx = 0; pupilIdx < pupilsPerSchool; pupilIdx++) {
      checkTemplate.createdAt = new Date().toISOString()
      pupils.push({
        id: uuid.v4(),
        check: checkTemplate
      })
    }
    schoolItem.pupils = pupils
    await redis.setex(`${redisKeyPrefix}:${schoolUUID}`, redisItemExpiryInSeconds, JSON.stringify(schoolItem))
  }
}

export default httpTrigger
