'use strict'
const sqlService = require('../../services/data-access/sql.service')
const { TYPES } = require('../../services/data-access/sql.service')

const pupilTestService = {
  findPupilByUPN: async function (upn) {
    const sql = 'SELECT * from mtc_admin.pupil where upn = @upn'
    const params = [{ name: 'upn', value: upn, type: TYPES.Char(13) }]
    const data = await sqlService.query(sql, params)
    return data[0]
  },

  updateForename: async function (id, foreName) {
    const sql = 'UPDATE mtc_admin.pupil set foreName = @s1 where id = @id'
    const params = [
      { name: 's1', value: foreName, type: TYPES.NVarChar(128) },
      { name: 'id', value: id, type: TYPES.Int }
    ]
    await sqlService.modify(sql, params)
  },

  updateMiddlenames: async function (id, foreName) {
    const sql = 'UPDATE mtc_admin.pupil set middleNames = @s1 where id = @id'
    const params = [
      { name: 's1', value: foreName, type: TYPES.NVarChar(128) },
      { name: 'id', value: id, type: TYPES.Int }
    ]
    await sqlService.modify(sql, params)
  },

  updateLastname: async function (id, lastname) {
    const sql = 'UPDATE mtc_admin.pupil set lastName = @s1 where id = @id'
    const params = [
      { name: 's1', value: lastname, type: TYPES.NVarChar(128) },
      { name: 'id', value: id, type: TYPES.Int }
    ]
    await sqlService.modify(sql, params)
  },

  updateGender: async function (id, gender) {
    const sql = 'UPDATE mtc_admin.pupil set gender = @s1 where id = @id'
    const params = [
      { name: 's1', value: gender, type: TYPES.Char(1) },
      { name: 'id', value: id, type: TYPES.Int }
    ]
    await sqlService.modify(sql, params)
  },

  updateUPN: async function (id, gender) {
    const sql = 'UPDATE mtc_admin.pupil set upn = @s1 where id = @id'
    const params = [
      { name: 's1', value: gender, type: TYPES.Char(13) },
      { name: 'id', value: id, type: TYPES.Int }
    ]
    await sqlService.modify(sql, params)
  },

  updateDob: async function (id, date) {
    const sql = 'UPDATE mtc_admin.pupil set dateOfBirth = @s1 where id = @id'
    const params = [
      { name: 's1', value: date.toDate(), type: TYPES.DateTimeOffset },
      { name: 'id', value: id, type: TYPES.Int }
    ]
    await sqlService.modify(sql, params)
  },

  updateForenameAlias: async function (id, alias) {
    const sql = 'UPDATE mtc_admin.pupil set foreNameAlias = @s1 where id = @id'
    const params = [
      { name: 's1', value: alias, type: TYPES.NVarChar(128) },
      { name: 'id', value: id, type: TYPES.Int }
    ]
    await sqlService.modify(sql, params)
  },

  updateLastnameAlias: async function (id, alias) {
    const sql = 'UPDATE mtc_admin.pupil set lastNameAlias = @s1 where id = @id'
    const params = [
      { name: 's1', value: alias, type: TYPES.NVarChar(128) },
      { name: 'id', value: id, type: TYPES.Int }
    ]
    await sqlService.modify(sql, params)
  }
}

module.exports = pupilTestService
