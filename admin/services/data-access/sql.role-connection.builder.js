'use strict'

const roles = require('../../lib/consts/roles')
const sqlConfig = require('../../config/sql.config')
const config = require('../../config')
const R = require('ramda')

const builder = {
  /**
   * @description builds a sql connection config object
   * @param {string} roleName - the role of the user to create a connection config for
   * @param {boolean} readonly - set to true for a readonly connection, typically to a sql azure replica
   * @returns {object} a config object that works with mssql
   */
  build: function build (roleName, readonly = false) {
    let cfg
    switch (roleName) {
      case roles.teacher:
        cfg = sqlConfig
        break
      case roles.techSupport:
        cfg = R.clone(sqlConfig)
        cfg.user = config.Sql.TechSupport.Username
        cfg.password = config.Sql.TechSupport.Password
        cfg.pool.min = config.Sql.TechSupport.Pool.Min
        cfg.pool.max = config.Sql.TechSupport.Pool.Max
        break
      default:
        throw new Error('role not supported')
    }
    cfg.options.readOnlyIntent = readonly
    return cfg
  }
}

module.exports = builder
