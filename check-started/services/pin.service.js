const moment = require('moment')
const R = require('ramda')
const checkDataService = require('../services/data-access/check.data.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const jwtService = require('../services/jwt.service')
const pinService = {}

/**
 * Expire pupil's pin and set started check timestamp
 * @param token
 * @param checkCode
 */
pinService.expirePupilPin = async (token, checkCode) => {
  const decoded = jwtService.decode(token)
  const pupil = await pupilDataService.sqlFindOneById(decoded.sub)
    // TODO should this use date service???
  const currentTimeStamp = moment.utc()
  await checkDataService.sqlUpdateCheckStartedAt(checkCode, currentTimeStamp)
  if (!pupil.isTestAccount) {
    pupil.pinExpiresAt = currentTimeStamp
    pupil.pin = null
    await pupilDataService.sqlUpdate(R.assoc('id', pupil.id, pupil))
  }
}

module.exports = pinService
