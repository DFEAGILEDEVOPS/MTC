'use strict'

const R = require('ramda')
const { TYPES } = require('./sql.service')

const sqlService = require('./sql.service')
const administrationMessageDataService = {}

/**
 * Create a new service message
 * @param data
 * @return
 */
administrationMessageDataService.sqlCreateOrUpdate = async (data) => {
  const params = [
    { name: 'title', value: data.title, type: TYPES.NVarChar(TYPES.MAX) },
    { name: 'message', value: data.message, type: TYPES.NVarChar(TYPES.MAX) },
    { name: 'code', value: data.borderColourCode, type: TYPES.Char(1) }
  ]

  if (data.id !== undefined) {
    // edit / update
    const sql = `
      UPDATE [mtc_admin].[serviceMessage]
      SET title = @title,
          message = @message,
          borderColourLookupId = (SELECT id FROM [mtc_admin].[serviceMessageBorderColourLookup] WHERE code = @code)
      WHERE id = @id`

    params.push(
      { name: 'id', value: data.id, type: TYPES.Int }
    )

    await sqlService.modify(sql, params)
  } else {
    // create
    let sql = `
      DECLARE @serviceMessageId INT;

      INSERT INTO [mtc_admin].[serviceMessage] (
        createdByUser_id,
        title,
        message,
        borderColourLookupId
      )
      VALUES (
        @createdByUserId,
        @title,
        @message,
        (SELECT id FROM [mtc_admin].[serviceMessageBorderColourLookup] where code = @code)
      );

      SET @serviceMessageId = SCOPE_IDENTITY();

    `
    params.push(
      { name: 'createdByUserId', value: data.createdByUser_id, type: TYPES.Int }
    )

    data.areaCode.forEach((code, i) => {
      sql += `INSERT INTO [mtc_admin].[serviceMessageServiceMessageArea] VALUES
              (@serviceMessageId, (SELECT id FROM [mtc_admin].[serviceMessageAreaLookup] WHERE code = @p${i}));
        `
      params.push({
        name: `p${i}`, value: code, type: TYPES.Char(1)
      })
    })
    await sqlService.modify(sql, params)
  }
}

/**
 * Delete the service message (single) row.
 * @returns {Promise.<void>}
 */
administrationMessageDataService.sqlDeleteServiceMessage = async () => {
  const sql = 'DELETE FROM [mtc_admin].serviceMessage'
  await sqlService.modify(sql)
}

/**
 * Fetch active service message
 * @return {Promise<{ title: string, message: string, urlSlug: srtring, borderColourCode: string, areaCodes: string[], areaDescriptions: string[], createdAt: moment.Moment, updatedAt: moment.Moment }>}
 */
administrationMessageDataService.sqlFindServiceMessages = async () => {
  const sql = `
  SELECT
    sm.id,
    sm.createdAt,
    sm.updatedAt,
    sm.title,
    sm.message,
    sm.urlSlug,
    bcl.code as borderColourCode,
    bcl.description as borderColourCodeDescription,
    STRING_AGG(area.code, ',') AS areaCodes,
    STRING_AGG(area.description, ',') AS areaDescriptions
  FROM
    mtc_admin.serviceMessage sm
    JOIN mtc_admin.serviceMessageBorderColourLookup bcl ON (sm.borderColourLookupId = bcl.id)
    JOIN mtc_admin.serviceMessageServiceMessageArea map ON (map.serviceMessageId = sm.id)
    JOIN mtc_admin.serviceMessageAreaLookup area ON (map.serviceMessageAreaLookupId = area.id)
  GROUP BY
    sm.id,
    sm.createdAt,
    sm.updatedAt,
    sm.title,
    sm.message,
    bcl.code,
    bcl.description,
    sm.urlSlug
  `
  const data = await sqlService.readonlyQuery(sql)
  const results = data.map(o => {
    return {
      title: o.title,
      message: o.message,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
      borderColourCode: o.borderColourCode,
      areaCodes: R.split(',', o.areaCodes),
      areaDescriptions: R.split(',', o.areaDescriptions),
      urlSlug: o.urlSlug
    }
  })
  return results
}

module.exports = administrationMessageDataService
