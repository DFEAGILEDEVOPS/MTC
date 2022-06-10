const sqlService = require('../data-access/sql.service')
import { TYPES } from '../data-access/sql.service'

export class PupilFrozenDataService {
/**
 * @description look up a pupils frozen flag by their id
 * @param {number} pupilId
 * @returns {Promise<Array<any>>}
 */
  public static async isFrozen (pupilId: number): Promise<any> {
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
 * @returns {Promise<Array<any>>}
 */
  public static async isFrozenByUrlSlug (pupilUrlSlug: string): Promise<any> {
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
 * @returns {Promise<Array<any>>}
 */
  public static async countFrozenByUrlSlugs (pupilUrlSlugs: Array<string>): Promise<any> {
    const { params, paramIdentifiers } = sqlService.buildParameterList(pupilUrlSlugs, TYPES.UniqueIdentifier,
      'pupilUrlSlug')
    const sql = `SELECT COUNT(id) as [frozenCount]
      FROM mtc_admin.pupil WHERE frozen=1 AND urlSlug IN (${paramIdentifiers.join(', ')})`
    return sqlService.readonlyQuery(sql, params)
  }

  /**
 * @description get the count of pupils who are frozen within a set of urlSlugs
 * @param {Array<string>} pupilIds
 * @returns {Promise<Array<any>>}
 */
   public static async countFrozenByPupilIds (pupilIds: Array<number>): Promise<any> {
     console.dir(pupilIds)
    const paramData = sqlService.buildParameterList(pupilIds, TYPES.Int,
      'pupilId')
    console.dir(paramData)
    const sql = `SELECT COUNT(id) as [frozenCount]
      FROM mtc_admin.pupil WHERE frozen=1 AND id IN (${paramData.paramIdentifiers.join(', ')})`
    return sqlService.readonlyQuery(sql, paramData.params)
  }
}
