'use strict'

const Setting = require('../../models/setting')
const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES

const settingDataService = {}

settingDataService.findOne = async function () {
  const sql = 'SELECT * FROM Settings WHERE id=@id'
  const params = [ {
    name: 'id',
    value: 1,
    type: TYPES.Int
  }]

  const result = await sqlService.query(sql, params)
  if (result && result.length === 1) {
    return result[0]
  }
  return {}
}

/**
 * Create or Update a document, depending on whether an `_id` field is present
 * @param doc
 * @return {Promise.<*>} returns a mongo response doc `{ n: 1, nModified: 1, ok: 1 }`
 */
settingDataService.createOrUpdate = async function (doc) {
  return Setting.update({_id: doc._id}, doc, {upsert: true}).exec()
}

module.exports = settingDataService
