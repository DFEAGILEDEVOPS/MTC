/**
 * @description This is a partial definition of the prepared check object that we store in Redis.
 * As we move toward a stricter ruleset, we are narrowing the use of supertypes through the introduction of unknown
 * which forces conversion to distinct types, and influences better type checking.
 */
export interface PreparedCheckPartial {
  checkCode: string
  schoolPin: string
  pupilPin: string
  pupil: {
    firstName: string
    lastName: string
    dob: Date
    checkCode: string
    check_id: number
    pinExpiresAt: Date
    uuid: string
  }
  school: {
    name: string
    uuid: string
  }
  tokens: {
    checkStarted: string
    pupilPreferences: string
    pupilFeedback: string
    checkComplete?: string
    jwt: {
      token: string
    }
  }
  questions: any[]
  config: {
    practice: boolean
  }
}
