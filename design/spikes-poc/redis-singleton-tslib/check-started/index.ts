import { AzureFunction, Context } from "@azure/functions"
import { RedisService } from './redis-service'
import { v4 as uuid } from 'uuid'

const queueTrigger: AzureFunction = async function (context: Context, myQueueItem: string): Promise<void> {
    const redis = new RedisService()
    const key = uuid()
    redis.set(key, myQueueItem)
}

export default queueTrigger
