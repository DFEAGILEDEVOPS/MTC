'use strict'

import * as moment from 'moment'
import * as R from 'ramda'
import * as checkDataService from '../services/data-access/check.data.service'
import * as pupilDataService from '../services/data-access/pupil.data.service'
import * as jwtService from '../services/jwt.service'

const pinService = {
  /**
   * Expire pupil's pin and set started check timestamp
   * @param token
   * @param checkCode
   */
  expirePupilPin: async (token, checkCode) => {
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
}

export = pinService
