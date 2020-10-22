/**
 * @description This is a partial definition of the prepared check object that we store in Redis.
 * As we move toward a stricter ruleset, we are narrowing the use of supertypes through the introduction of unknown
 * which forces conversion to distinct types, and influences better type checking.
 */
export interface PreparedCheckPartial {
  checkCode: string
  config: {
    practice: boolean
  }
}
