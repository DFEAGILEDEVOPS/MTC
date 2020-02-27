'use strict'

const mssql = require('mssql')
const config = require('../../../config')
const predicates = require('./predicates')

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
      meta.stderr.push(`${(new Date()).toISOString()} school-import: ${msg}`)
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
   * @param school - school attributes with our mapped property names
   * @return {boolean}
   */
  isPredicated (school) {
    const targetAge = 9
    return predicates.isSchoolOpen(this.log, school) &&
      predicates.isNotBritishOverseas(this.log, school) &&
      predicates.isAgeInRange(this.log, targetAge, school)
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
    table.columns.add('estabCode', mssql.NVarChar(mssql.MAX), { nullable: true })
    table.columns.add('leaCode', mssql.Int, { nullable: true })
    table.columns.add('name', mssql.NVarChar(mssql.MAX), { nullable: false })
    table.columns.add('urn', mssql.Int, { nullable: false })

    for (let i = 0; i < data.length; i++) {
      const mapped = this.getMappedData(data[i], mapping)
      meta.linesProcessed += 1

      if (this.isPredicated(mapped)) {
        meta.schoolsLoaded += 1
        const dfeNumber = parseInt('' + mapped.leaCode + mapped.estabCode, 10)
        if (dfeNumber.toString().length !== 7) {
          this.logError(`${name} school [${mapped.urn}] has a short dfeNumber [${dfeNumber}]`)
        }
        table.rows.add(dfeNumber, mapped.estabCode, parseInt(mapped.leaCode, 10), mapped.name, parseInt(mapped.urn, 10))
      }
    }
    context.log.verbose(`${name} data rows added for bulk upload`)
    const request = new mssql.Request(pool)
    context.log.verbose(`${name} new request obj created`)
    if (meta.schoolsLoaded > 0) {
      try {
        const res = await request.bulk(table)
        context.log(`${name} bulk request complete: `, res)
      } catch (error) {
        this.logError(`Bulk request failed. Error was:\n ${error.message}`)
        error.jobResult = meta
        throw error
      }
    }
    return meta
  }
}

module.exports = schoolDataService
