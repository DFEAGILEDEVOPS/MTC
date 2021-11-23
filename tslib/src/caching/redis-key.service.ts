export interface IRedisKeyService {
  getSchoolResultsKey (schoolId: number): string
  getPreparedCheckLookupKey (checkCode: string): string
  /**
   * Return the prefix used for the pupil-register-view-data keys
   */
  getPupilRegisterPrefix (): string
}

class RedisKeyService implements IRedisKeyService {
  /**
   * Return the key for the school results
   * @param schoolId DB school.id
   * @return {string}
   */
  getSchoolResultsKey (schoolId: number): string {
    return `result:${schoolId}`
  }

  getPreparedCheckLookupKey (checkCode: string): string {
    return `prepared-check-lookup:${checkCode.toUpperCase()}`
  }

  getPupilRegisterPrefix (): string {
    return 'pupilRegisterViewData:'
  }
}

export default new RedisKeyService()
