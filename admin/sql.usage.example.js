'use strict'

const TYPES = require('tedious').TYPES
const sqlConnectionService = require('./services/data-access/sql.connection.service')
const sqlService = require('./services/data-access/sql.service')

sqlConnectionService.init()

const examples = {}

examples.getData = () => {
  sqlService.query('SELECT * FROM settings')
    .then(result => console.log('query settings table result:', result))
}

examples.modifyData = () => {
  const id = { name: 'id', type: TYPES.Int, value: 2 }
  const updatedAt = { name: 'updatedAt', type: TYPES.DateTime2, value: TYPES.Null }
  const loadingTimeLimit = { name: 'loadingTimeLimit', type: TYPES.TinyInt, value: 1 }
  const questionTimeLimit = { name: 'questionTimeLimit', type: TYPES.TinyInt, value: 2 }

  sqlService.modify('INSERT settings (id, updatedAt, loadingTimeLimit, questionTimeLimit) VALUES (@id, @updatedAt, @loadingTimeLimit, @questionTimeLimit)',
    id, updatedAt, loadingTimeLimit, questionTimeLimit)
}

examples.modifyData()
examples.getData()
