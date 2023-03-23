'use strict'

const roles = require('../../lib/consts/roles')
const sqlConfig = require('../../config/sql.config')
const R = require('ramda')
const deepFreeze = require('../../lib/deep-freeze')
const config = require('../../config')

const builder = {
  /**
   * @description builds a sql connection config object based upon the users role
   * @param {string} roleName - the role of the user to create a connection config for
   * @param {boolean} readonly - set to true for a readonly connection, typically to a sql azure replica
   * @returns {object} a config object that works with mssql
   */
  build: function build (roleName, readonly = false) {
    const cfg = R.clone(sqlConfig)
    switch (roleName) {
      case roles.teacher:
        break
      case roles.techSupport:
        cfg.user = config.Sql.TechSupport.Username
        cfg.password = config.Sql.TechSupport.Password
        cfg.pool.min = config.Sql.TechSupport.Pool.Min
        cfg.pool.max = config.Sql.TechSupport.Pool.Max
        break
      default:
        throw new Error(`role '${roleName}' not yet supported in connection builder`)
    }
    cfg.options.readOnlyIntent = readonly
    return deepFreeze(cfg)
  }
}

module.exports = builder
