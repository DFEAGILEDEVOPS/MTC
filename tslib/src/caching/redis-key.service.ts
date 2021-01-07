export interface IRedisKeyService {
  getSchoolResultsKey (schoolId: number): string
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
}

export default new RedisKeyService()
