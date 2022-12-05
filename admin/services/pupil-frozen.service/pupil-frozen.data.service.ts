import { TYPES } from '../data-access/sql.service'
const sqlService = require('../data-access/sql.service')

export class PupilFrozenDataService {
/**
 * @description get the count of pupils who are frozen within a set of urlSlugs
 * @param {Array<string>} pupilUrlSlugs
 * @returns {Promise<number>}
 */
  public static async getFrozenCountByUrlSlugs (pupilUrlSlugs: string[]): Promise<number> {
    const { params, paramIdentifiers } = sqlService.buildParameterList(pupilUrlSlugs, TYPES.UniqueIdentifier,
      'pupilUrlSlug')
    const sql = `SELECT COUNT(id) as [frozenCount]
      FROM mtc_admin.pupil WHERE frozen=1 AND urlSlug IN (${paramIdentifiers.join(', ')})`
    const result = await sqlService.readonlyQuery(sql, params)
    return result[0].frozenCount
  }

  /**
 * @description get the count of pupils who are frozen within a set of urlSlugs
 * @param {Array<number>} pupilIds
 * @returns {Promise<number>}
 */
  public static async getFrozenCountByPupilIds (pupilIds: number[]): Promise<number> {
    const paramData = sqlService.buildParameterList(pupilIds, TYPES.Int,
      'pupilId')
    const sql = `SELECT COUNT(id) as [frozenCount]
      FROM mtc_admin.pupil WHERE frozen=1 AND id IN (${paramData.paramIdentifiers.join(', ')})`
    const result = await sqlService.readonlyQuery(sql, paramData.params)
    return result[0].frozenCount
  }

  /**
 * @description freeze a pupil record
 * @param {string} pupilUrlSlug
 * @returns {Promise<void>} lacks parity with sqlService.modify as it isn't fully typed beyond 'promise'
 */
  public static async freezePupil (pupilUrlSlug: string, currentUserId: number): Promise<void> {
    const sql = 'UPDATE mtc_admin.pupil SET frozen=1, lastModifiedBy_userId=@userId WHERE urlSlug=@pupilUrlSlug'
    const params = [{
      name: 'pupilUrlSlug',
      type: TYPES.UniqueIdentifier,
      value: pupilUrlSlug
    }, {
      name: 'userId',
      type: TYPES.Int,
      value: currentUserId
    }]
    return sqlService.modify(sql, params)
  }

  /**
 * @description thaw a pupil record
 * @param {string} pupilUrlSlug
 * @returns {Promise<void>} lacks parity with sqlService.modify as it isn't fully typed beyond 'promise'
 */
  public static async thawPupil (pupilUrlSlug: string, currentUserId: number): Promise<void> {
    const sql = 'UPDATE mtc_admin.pupil SET frozen=0, lastModifiedBy_userId=@userId WHERE urlSlug=@pupilUrlSlug'
    const params = [{
      name: 'pupilUrlSlug',
      type: TYPES.UniqueIdentifier,
      value: pupilUrlSlug
    }, {
      name: 'userId',
      type: TYPES.Int,
      value: currentUserId
    }]
    return sqlService.modify(sql, params)
  }
}
