'use strict'

require('dotenv').config()
const TYPES = require('tedious').TYPES
const sqlConnectionService = require('./services/data-access/sql.connection.service')
const sqlService = require('./services/data-access/sql.service')

sqlConnectionService.init()

const examples = {}

examples.getData = async () => {
  const data = await sqlService.query('SELECT * FROM role')
  console.log('results of role table query...')
  console.dir(data)
}

examples.modifyData = async () => {
  const role = { name: 'role', type: TYPES.NVarChar, value: 'testing' }
  const sql = 'INSERT role (role) VALUES (@role)'
  const params = [role]
  const rowsInserted = await sqlService.modify(sql, params)
  console.log('rows inserted:', rowsInserted)
}
