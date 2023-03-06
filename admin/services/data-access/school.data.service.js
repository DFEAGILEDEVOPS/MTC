'use strict'

const { TYPES } = require('./sql.service')
const R = require('ramda')
const sqlService = require('./sql.service')
const config = require('../../config')

const schoolDataService = {
  /**
   * Find a School by the id
   * number -> {School} || undefined
   * @param {number} id
   * @return {Promise<object>}
   */
  sqlFindOneById: async (id) => {
    const paramId = { name: 'id', type: TYPES.Int, value: id }
    const sql = `
        SELECT school.*, ISNULL(sce.timezone, '${config.DEFAULT_TIMEZONE}') as timezone
        FROM [mtc_admin].[school]
        LEFT JOIN [mtc_admin].sce
          ON sce.school_id = school.id
        WHERE school.id = @id
      `
    const rows = await sqlService.readonlyQuery(sql, [paramId], `schoolData.sqlFindOneById.${id}`)
    return R.head(rows)
  },

  /**
   * Find a School from the pin
   * @param {number} pin
   * @return {Promise<object>}
   */
  sqlFindOneBySchoolPin: async (pin) => {
    const paramPin = { name: 'pin', type: TYPES.Char, value: pin }
    const sql = `
        SELECT *
        FROM [mtc_admin].[school]
        WHERE pin = @pin
      `
    const rows = await sqlService.readonlyQuery(sql, [paramPin])
    return R.head(rows)
  },

  /**
   * Find a School by DfeNumber
   * @param dfeNumber
   * @return {Promise<object>}
   */
  sqlFindOneByDfeNumber: async (dfeNumber) => {
    const paramDfeNumber = { name: 'dfeNumber', type: TYPES.Int, value: dfeNumber }
    const sql = `
        SELECT school.*, ISNULL(sce.timezone, '${config.DEFAULT_TIMEZONE}') as timezone
        FROM [mtc_admin].[school]
        LEFT JOIN [mtc_admin].sce
          ON sce.school_id = school.id
        WHERE dfeNumber = @dfeNumber
      `
    const rows = await sqlService.readonlyQuery(sql, [paramDfeNumber])
    return R.head(rows)
  },

  sqlUpdateBySlug: async function sqlUpdateBySlug (slug, update, userId) {
    const sql = `
      DECLARE @typeOfEstablishmentLookupId Int = (SELECT id FROM mtc_admin.typeOfEstablishmentLookup WHERE code = @typeOfEstablishmentCode);

      IF @typeOfEstablishmentLookupId IS NULL
        BEGIN
          DECLARE @msg NVARCHAR(128) = CONCAT('unknown typeOfEstablishmentCode: ', CAST(@typeOfEstablishmentCode as NVARCHAR(10)));
          THROW 51000, @msg, 1;
        END;

      UPDATE mtc_admin.[school]
      SET
          dfeNumber = @dfeNumber,
          estabCode = @estabCode,
          leaCode = @leaCode,
          name = @name,
          urn = @urn,
          typeOfEstablishmentLookup_id = @typeOfEstablishmentLookupId,
          lastModifiedBy_userId=@userId,
          isTestSchool = @isTestSchool
      WHERE urlSlug = @slug
    `
    const params = [
      { name: 'dfeNumber', value: update.dfeNumber, type: TYPES.Int },
      { name: 'estabCode', value: update.estabCode, type: TYPES.Int },
      { name: 'leaCode', value: update.leaCode, type: TYPES.Int },
      { name: 'name', value: update.name, type: TYPES.NVarChar(TYPES.MAX) },
      { name: 'slug', value: slug, type: TYPES.UniqueIdentifier },
      { name: 'urn', value: update.urn, type: TYPES.Int },
      { name: 'userId', value: userId, type: TYPES.Int },
      { name: 'typeOfEstablishmentCode', value: update.typeOfEstablishmentCode, type: TYPES.Int },
      { name: 'isTestSchool', value: update.isTestSchool, type: TYPES.Bit }
    ]
    return sqlService.modify(sql, params)
  },

  /**
   * Find school by array of ids.
   * @param ids
   * @returns {Promise<*>}
   */
  sqlFindByIds: async (ids) => {
    if (!(Array.isArray(ids) && ids.length > 0)) {
      throw new Error('No ids provided')
    }
    const select = `
    SELECT *
    FROM [mtc_admin].[school]
    `
    const { params, paramIdentifiers } = sqlService.buildParameterList(ids, TYPES.Int)
    const whereClause = 'WHERE id IN (' + paramIdentifiers.join(', ') + ')'
    const sql = [select, whereClause].join(' ')
    return sqlService.readonlyQuery(sql, params)
  },

  /**
   * Find schools by DfeNumbers
   * @param {Array} dfeNumbers
   * @return {Promise<Array<*>>}
   */
  sqlFindByDfeNumbers: async (dfeNumbers) => {
    if (!(Array.isArray(dfeNumbers) && dfeNumbers.length > 0)) {
      throw new Error('No dfeNumbers provided')
    }
    const select = `
  SELECT *
  FROM [mtc_admin].[school]
  `
    const { params, paramIdentifiers } = sqlService.buildParameterList(dfeNumbers, TYPES.Int)
    const whereClause = 'WHERE dfeNumber IN (' + paramIdentifiers.join(', ') + ')'
    const sql = [select, whereClause].join(' ')
    return sqlService.readonlyQuery(sql, params)
  },

  /**
   * Find a School by urn
   * @param urn unique reference number for school
   * @return {Promise<object>}
   */
  sqlFindOneByUrn: async (urn) => {
    const paramUrn = { name: 'urn', type: TYPES.Int, value: urn }
    const sql = `
        SELECT school.*, ISNULL(sce.timezone, '${config.DEFAULT_TIMEZONE}') as timezone
        FROM [mtc_admin].school
        LEFT JOIN [mtc_admin].sce
          ON sce.school_id = school.id
        WHERE urn = @urn
      `
    const rows = await sqlService.readonlyQuery(sql, [paramUrn])
    return R.head(rows)
  },

  sqlSearch: async (query) => {
    const params = [
      { name: 'query', value: query, type: TYPES.Int }
    ]
    const sql = `
      SELECT
          id, name, leaCode, estabCode, name, dfeNumber, urn, urlSlug
      FROM mtc_admin.school
      WHERE dfeNumber = @query OR urn = @query
    `
    const res = await sqlService.query(sql, params)
    if (res.length > 0) {
      return res[0]
    }
  },

  /**
   * Find a school
   * @param {string} slug - uuid/v4
   * @return {Promise<Object>}
   */
  sqlFindOneBySlug: async function (slug) {
    const params = [
      { name: 'slug', value: slug, type: TYPES.UniqueIdentifier }
    ]
    const sql = `SELECT
        s.id,
        s.name,
        s.leaCode,
        s.estabCode,
        s.dfeNumber,
        s.urn,
        s.urlSlug,
        s.isTestSchool,
        (
          SELECT
            COUNT(*)
          FROM
            mtc_admin.pupil
          WHERE
            school_id = s.id
        ) AS numberOfPupils,
        el.code as typeOfEstablishmentCode,
        el.name as typeOfEstablishmentName
      FROM
        mtc_admin.school s
        LEFT JOIN mtc_admin.typeOfEstablishmentLookup el ON (
          s.typeOfEstablishmentLookup_id = el.id
        )
      WHERE
        s.urlSlug = @slug`
    const res = await sqlService.query(sql, params)
    return R.head(res)
  },

  /**
   * Service-manager: add a new school
   * @param data
   * @returns {Promise<unknown>}
   */
  sqlAddSchool: async function (data, userId) {
    const sql = `
        DECLARE @typeOfEstablishmentLookupId Int = (SELECT id FROM mtc_admin.typeOfEstablishmentLookup WHERE code = @typeOfEstablishmentCode);

        IF @typeOfEstablishmentLookupId IS NULL
          BEGIN
            DECLARE @msg NVARCHAR(128) = CONCAT('unknown typeOfEstablishmentCode: ', CAST(@typeOfEstablishmentCode as NVARCHAR(10)));
            THROW 51000, @msg, 1;
          END;

        INSERT INTO [mtc_admin].[school] (leaCode, estabCode, dfeNumber, urn, name, lastModifiedBy_userId, typeOfEstablishmentLookup_id, isTestSchool)
        VALUES (@leaCode, @estabCode, @dfeNumber, @urn, @name, @userId, @typeOfEstablishmentLookupId, @isTestSchool);
    `
    const params = [
      { name: 'estabCode', value: data.estabCode, type: TYPES.Int },
      { name: 'leaCode', value: data.leaCode, type: TYPES.Int },
      { name: 'dfeNumber', value: data.dfeNumber, type: TYPES.Int },
      { name: 'urn', value: data.urn, type: TYPES.Int },
      { name: 'name', value: data.name, type: TYPES.NVarChar(TYPES.MAX) },
      { name: 'userId', value: userId, type: TYPES.Int },
      { name: 'typeOfEstablishmentCode', value: data.typeOfEstablishmentCode, type: TYPES.Int },
      { name: 'isTestSchool', value: data.isTestSchool, type: TYPES.Bit }
    ]
    return sqlService.modify(sql, params)
  }
}

module.exports = schoolDataService
