export interface IRedisKeyService {
  getSchoolResultsKey (schoolId: number): string
  getPreparedCheckLookupKey (checkCode: string): string
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
}

export default new RedisKeyService()
