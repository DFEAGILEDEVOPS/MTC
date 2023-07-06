import * as checkWindowPhaseConsts from '../../lib/consts/check-window-phase'
import * as moment from 'moment'
const checkWindowService = require('../check-window-v2.service')
const settingsService = require('../setting.service')
const logger = require('../log.service').getLogger()

export class CheckWindowPhaseService {
  static async getPhase (): Promise<number> {
    try {
      const cw = await checkWindowService.getActiveCheckWindow(true)
      const currentDate = moment.utc()

      if (currentDate.isBefore(cw.adminStartDate)) {
        return checkWindowPhaseConsts.unavailable
      }

      if (currentDate.isAfter(cw.adminStartDate) && currentDate.isBefore(cw.familiarisationCheckStartDate)) {
        return checkWindowPhaseConsts.preStart
      }

      if (currentDate.isAfter(cw.familiarisationCheckStartDate) && currentDate.isBefore(cw.checkStartDate)) {
        return checkWindowPhaseConsts.tryItOut
      }

      if (currentDate.isAfter(cw.checkStartDate) && currentDate.isBefore(cw.checkEndDate)) {
        return checkWindowPhaseConsts.officialCheck
      }

      if (currentDate.isAfter(cw.checkEndDate) && currentDate.isBefore(cw.adminEndDate)) {
        return checkWindowPhaseConsts.postCheckAdmin
      }

      if (currentDate.isAfter(cw.adminEndDate)) {
        const settings = await settingsService.get()
        if (settings.isPostAdminEndDateUnavailable === false) {
          return checkWindowPhaseConsts.readOnlyAdmin
        }
      }

      return checkWindowPhaseConsts.unavailable
    } catch (error) {
      let msg = 'unknown error'
      if (error instanceof Error) {
        msg = error.message
      }
      logger.error(`Unable to determine current check window phase: ${msg}`)

      // Safe default - tbc
      return checkWindowPhaseConsts.unavailable
    }
  }
}
