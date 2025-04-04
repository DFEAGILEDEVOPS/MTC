'use strict'

const sql = require('mssql')
const config = require('./config')

async function checkDatabaseIsUp () {
  try {
    // make sure that any items are correctly URL encoded in the connection string
    await sql.connect(`Server=${config.Sql.Server},${config.Sql.Port};Database=${config.Sql.Database};User Id=${config.Sql.Application.Username};Password=${config.Sql.Application.Password};Encrypt=false`)
    const result = await sql.query('SELECT * FROM mtc_admin.[role] WHERE [title] = \'TECH-SUPPORT\'')
    await sql.close()
    if (result && result.recordset && result.recordset[0] && result.recordset[0].id) {
      console.log('Success: db is ready')
      return true
    } else {
      process.exitCode = 1
      return false
    }
  } catch (error) {
    console.log('Error: db is not ready', error.message)
    process.exitCode = 1
    return false
  }
}

checkDatabaseIsUp()
  .then(() => {
    // do nothing
  })
