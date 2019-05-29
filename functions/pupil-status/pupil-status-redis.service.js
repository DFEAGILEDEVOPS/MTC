const redisCacheService = require('../../admin/services/redis-cache.service')
const adminSQLService = require('../../admin/services/data-access/sql.service')
const { REDIS_CACHING, REDIS_CACHE_UPDATING } = require('../config')

/**
 * Update a batch of pupils in one redis call
 * @param {[{pupilId: <number>, targetStatusCode: <string>}]} updates
 */
const updatePupilStatuses = async (updates, context) => {
  if (!REDIS_CACHING || !REDIS_CACHE_UPDATING) {
    return false
  }

  let pupilStatusLinkTableRedis
  let pupilStatusTableRedis
  try {
    pupilStatusLinkTableRedis = await redisCacheService.get('table.pupilStatusLink')
    pupilStatusTableRedis = await redisCacheService.get('table.pupilStatus')
    if (!pupilStatusLinkTableRedis) {
      pupilStatusLinkTableRedis = await adminSQLService.cacheTableInRedis('pupilStatusLink')
    }
    if (!pupilStatusTableRedis) {
      pupilStatusTableRedis = await adminSQLService.cacheTableInRedis('pupilStatus')
    }
  } catch (e) {
    context.log.error('Reading pupil and pupilStatus redis caches in updatePupilStatuses failed')
    context.log.error(e)
    throw e
  }

  if (!pupilStatusLinkTableRedis || !pupilStatusTableRedis) {
    return false
  }

  const pupilStatusCodes = {}
  pupilStatusTableRedis.forEach(e => {
    pupilStatusCodes[e.code] = e.id
  })

  const updatesLn = updates.length
  const pupilTableRedisLn = pupilStatusLinkTableRedis.length
  for (let i = 0; i < updatesLn; i++) {
    const update = updates[i]
    let updated = false
    for (let j = 0; j < pupilTableRedisLn; j++) {
      const pupilStatusRow = pupilStatusLinkTableRedis[j]
      if (update.pupilId === pupilStatusRow.id) {
        pupilStatusLinkTableRedis[j].pupilStatus_id = pupilStatusCodes[update.targetStatusCode]
        updated = true
        break
      }
    }
    if (!updated) {
      let newID = 1
      if (pupilStatusLinkTableRedis.length) {
        newID = Array.from(pupilStatusLinkTableRedis).pop().id + 1
      }
      pupilStatusLinkTableRedis.push({
        id: newID,
        pupil_id: update.pupilId,
        pupilStatus_id: pupilStatusCodes[update.targetStatusCode]
      })
    }
  }

  try {
    await redisCacheService.set('table.pupilStatusLink', pupilStatusLinkTableRedis)
    context.log('pupil-status: pupil redis cache updated successfully')
  } catch (e) {
    context.log.error('pupil-status: setting pupil redis cache in updatePupilStatuses failed')
    context.log.error(e)
    throw e
  }

  return true
}

module.exports = { updatePupilStatuses }
