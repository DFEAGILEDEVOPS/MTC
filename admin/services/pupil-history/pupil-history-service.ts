import { type IPupilHistoryCheckData, type IPupilHistoryPupilData, type IPupilHistoryRestartData, type IPupilHistorySchoolData, PupilHistoryDataService } from './data-access/pupil-history.data.service'
import * as R from 'ramda'
import { type Moment } from 'moment-timezone'

export interface IPupilHistory {
  school: IPupilHistorySchoolData
  pupil: IPupilHistoryPupilData
  checks: IPupilHistoryCheckData[]
  restarts: IPupilHistoryRestartData[]
  meta: {
    restartsTakenCount: number
  }
}

export type TCheckStatus = 'Pin generated' | 'Logged in' | 'Check received' | 'Received data error' | 'Check complete' | 'n/a'

export interface IPupilHistoryEvent {
  occurredAt: Moment
  action: 'Pin generated' | 'Logged in' | 'Check received' | 'Check complete' | 'Restart'
  check?: IPupilHistoryCheckData & { active: boolean }
  restart?: IPupilHistoryRestartData
}

export class PupilHistoryService {
  public static async getTimeline (pupilUuid: string): Promise<IPupilHistoryEvent[]> {
    const history = await PupilHistoryService.getHistory(pupilUuid)
    const events: IPupilHistoryEvent[] = []
    for (const check of history.checks) {
      const checkEvents: [IPupilHistoryEvent['action'], Moment | null][] = [
        ['Pin generated', check.createdAt],
        ['Logged in', check.pupilLoginDate],
        ['Check received', check.receivedByServerAt],
        ['Check complete', check.completedAt]
      ]
      for (const [action, occurredAt] of checkEvents) {
        if (occurredAt !== null) {
          events.push({
            occurredAt,
            action,
            check: { ...check, active: history.pupil.currentCheckId === check.id }
          })
        }
      }
    }
    for (const restart of history.restarts) {
      events.push({ occurredAt: restart.createdAt, action: 'Restart', restart })
    }
    return events.sort((a, b) => b.occurredAt.valueOf() - a.occurredAt.valueOf())
  }

  private static getCheckStatus (check: IPupilHistoryCheckData): TCheckStatus {
    if (check.complete) {
      return 'Check complete'
    } else if (check.processingFailed === true) {
      return 'Received data error'
    } else if (check.complete === false && check.pupilLoginDate !== null && check.received === false && check.processingFailed === false) {
      return 'Logged in'
    } else if (check.complete === false && check.pupilLoginDate !== null && check.received === true && check.processingFailed === false) {
      return 'Check received'
    } else if (check.complete === false && check.pupilLoginDate === null && check.received === false && check.processingFailed === false) {
      return 'Pin generated'
    }

    return 'n/a'
  }

  public static async getHistory (pupilUuid: string): Promise<IPupilHistory> {
    const rawPupilHistory = await PupilHistoryDataService.getPupilHistory(pupilUuid)
    // Add a check status to each check
    const transformedChecks = rawPupilHistory.checks.map(check => {
      const status = PupilHistoryService.getCheckStatus(check)
      const transCheck = R.assoc('checkStatus', status, check)
      return transCheck
    })
    return {
      school: rawPupilHistory.school,
      restarts: rawPupilHistory.restarts,
      pupil: rawPupilHistory.pupil,
      checks: transformedChecks,
      meta: {
        restartsTakenCount: rawPupilHistory.restarts.length
      }
    }
  }
}
