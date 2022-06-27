const sqlService = require('../data-access/sql.service')
import { TYPES } from '../data-access/sql.service'

export class PupilFrozenDataService {
/**
 * @description look up a pupils frozen flag by their id
 * @param {number} pupilId
 * @returns {Promise<{frozen: boolean}[] | []>}
 */
  public static async getFrozenByPupilId (pupilId: number): Promise<{frozen: boolean}[] | []> {
    const sql = 'SELECT frozen FROM mtc_admin.pupil WHERE id=@pupilId'
    const params = [{
      name: 'pupilId',
      type: TYPES.Int,
      value: pupilId
    }]
    return sqlService.readonlyQuery(sql, params)
  }

/**
 * @description look up a pupils frozen flag by their urlSlug
 * @param {string} pupilUrlSlug
 * @returns {Promise<{frozen: boolean}[] | []>}
 */
  public static async getFrozenByUrlSlug (pupilUrlSlug: string): Promise<{frozen: boolean}[] | []> {
    const sql = 'SELECT frozen FROM mtc_admin.pupil WHERE urlSlug=@pupilUrlSlug'
    const params = [{
      name: 'pupilUrlSlug',
      type: TYPES.UniqueIdentifier,
      value: pupilUrlSlug
    }]
    return sqlService.readonlyQuery(sql, params)
  }

/**
 * @description get the count of pupils who are frozen within a set of urlSlugs
 * @param {Array<string>} pupilUrlSlugs
 * @returns {Promise<[ { frozenCount: number } ]>}
 */
  public static async getFrozenCountByUrlSlugs (pupilUrlSlugs: Array<string>): Promise<[ { frozenCount: number } ]> {
    const { params, paramIdentifiers } = sqlService.buildParameterList(pupilUrlSlugs, TYPES.UniqueIdentifier,
      'pupilUrlSlug')
    const sql = `SELECT COUNT(id) as [frozenCount]
      FROM mtc_admin.pupil WHERE frozen=1 AND urlSlug IN (${paramIdentifiers.join(', ')})`
    return sqlService.readonlyQuery(sql, params)
  }

  /**
 * @description get the count of pupils who are frozen within a set of urlSlugs
 * @param {Array<string>} pupilIds
 * @returns {Promise<[ { frozenCount: number } ]>}
 */
   public static async getFrozenCountByPupilIds (pupilIds: Array<number>): Promise<[{ frozenCount: number}]> {
    const paramData = sqlService.buildParameterList(pupilIds, TYPES.Int,
      'pupilId')
    const sql = `SELECT COUNT(id) as [frozenCount]
      FROM mtc_admin.pupil WHERE frozen=1 AND id IN (${paramData.paramIdentifiers.join(', ')})`
    return sqlService.readonlyQuery(sql, paramData.params)
  }

  /**
 * @description freeze a pupil record
 * @param {string} pupilUrlSlug
 * @returns {Promise<{void>}
 */
  public static async freezePupil (pupilUrlSlug: string): Promise<void> {
    const sql = 'UPDATE mtc_admin.pupil SET frozen=1 WHERE urlSlug=@pupilUrlSlug'
    const params = [{
      name: 'pupilUrlSlug',
      type: TYPES.UniqueIdentifier,
      value: pupilUrlSlug
    }]
    return sqlService.modify(sql, params)
  }

    /**
 * @description thaw a pupil record
 * @param {string} pupilUrlSlug
 * @returns {Promise<{void>}
 */
  public static async thawPupil (pupilUrlSlug: string): Promise<void> {
    const sql = 'UPDATE mtc_admin.pupil SET frozen=0 WHERE urlSlug=@pupilUrlSlug'
    const params = [{
      name: 'pupilUrlSlug',
      type: TYPES.UniqueIdentifier,
      value: pupilUrlSlug
    }]
    return sqlService.modify(sql, params)
  }
}
