
'use strict'

const mssql = require('mssql')
const config = require('../../../config')
let pool
const name = 'school-import'
let meta = {}

const schoolDataService = {
  log (msg) {
    if (!meta.stdout) {
      meta.stdout = []
    }
    if (msg) {
      meta.stdout.push(`${(new Date()).toISOString()} school-import: ${msg}`)
    }
  },

  logError (msg) {
    if (!meta.stderr) {
      meta.stderr = []
    }
    if (msg) {
      meta.stdout.push(`${(new Date()).toISOString()} school-import: ${msg}`)
    }
  },

  async initPool (context) {
    const poolConfig = {
      database: config.Sql.Database,
      server: config.Sql.Server,
      port: config.Sql.Port,
      requestTimeout: config.Sql.requestTimeout,
      connectionTimeout: config.Sql.connectionTimeout,
      user: config.Sql.PupilCensus.Username,
      password: config.Sql.PupilCensus.Password,
      pool: {
        min: config.Sql.Pooling.MinCount,
        max: config.Sql.Pooling.MaxCount
      },
      options: {
        appName: config.Sql.Application.Name,
        encrypt: config.Sql.Encrypt
      }
    }

    pool = new mssql.ConnectionPool(poolConfig)
    pool.on('error', err => {
      context.log('SQL Pool Error:', err)
    })
    await pool.connect()
    return pool
  },

  /**
   * Return a domain-mapped object from a
   * @param {Array} row - csv row as array ['1001', 'Sometown Primary school', 'csv', 'array', ... ]
   * @param {Object} mapping - mapping object { urn: 0, name: 1, ... }
   * @return {Object} - mapped object of string values E.g. { urn: '1001', 'name': 'Sometown Primary School' ... }
   */
  getMappedData (row, mapping) {
    const o = {}
    Object.keys(mapping).forEach(k => {
      o[k] = row[mapping[k]]
    })
    return o
  },

  /**
   * Determine if the record should be loaded
   * @param mapped - school attributes with our mapped property names
   * @return {boolean}
   */
  isPredicated (mapped) {
    const low = mapped.statLowAge
    const high = mapped.statHighAge
    if (low === undefined || high === undefined) {
      this.logError(`${name} Missing data for school URN [${mapped.urn}] obj ${JSON.stringify(mapped)}`)
    }
    if (mapped.estabStatusCode !== '1' || mapped.estabStatusCode !== '3' || mapped.estabStatusCode !== '4') {
      // 1 - open, 2 - closed, 3 - open proposed to close, 4 - Proposed to open
      this.log(`school ${mapped.urn} will not be loaded - estabStatusCode is [${mapped.estabStatusCode}]`)
      return false
    }
    const targetAge = 9
    if (low < targetAge && high >= targetAge) {
      return true
    }
    this.log(`school ${mapped.urn} does not meet age criteria ${mapped.statLowAge}-${mapped.statHighAge}`)
    return false
  },

  /**
   * Perform a bulk upload to the school table, inserting new schools
   * @param context - function context object
   * @param data - the csv parsed to array or arrays without header row
   * @param mapping - the mapping between our domain and the input file
   * @return {Promise<{linesProcessed: number, schoolsLoaded: number}>}
   */
  async bulkUpload (context, data, mapping) {
    context.log.verbose(`${name}.school.data.service.bulkUpload() called`)
    meta = { linesProcessed: 0, schoolsLoaded: 0 }
    if (!pool) {
      context.log.verbose(`${name}: connecting to mssql pool`)
      await this.initPool(context)
    }
    const table = new mssql.Table('[mtc_admin].[school]')
    table.create = false
    table.columns.add('dfeNumber', mssql.Int, { nullable: false })
    table.columns.add('estabCode', mssql.NVarChar(4000), { nullable: true })
    table.columns.add('leaCode', mssql.Int, { nullable: true })
    table.columns.add('name', mssql.NVarChar(4000), { nullable: false })
    table.columns.add('urn', mssql.Int, { nullable: false })

    for (let i = 0; i < data.length; i++) {
      const mapped = this.getMappedData(data[i], mapping)
      meta.linesProcessed += 1
      if (this.isPredicated(mapped)) {
        meta.schoolsLoaded += 1
        const dfeNumber = parseInt('' + mapped.leaCode + mapped.estabCode, 10)
        if (dfeNumber.length !== 7) {
          this.logError(`${name} school [${mapped.urn}] has a bad dfeNumber [${dfeNumber}]`)
        }
        table.rows.add(dfeNumber, mapped.estabCode, parseInt(mapped.leaCode, 10), mapped.name, parseInt(mapped.urn, 10))
      }
    }

    context.log.verbose(`${name} data rows added for bulk upload`)
    const request = new mssql.Request(pool)
    context.log.verbose(`${name} new request obj created`)
    await request.bulk(table)
    context.log(`${name} bulk request complete`)
    return meta
  }
}

module.exports = schoolDataService
