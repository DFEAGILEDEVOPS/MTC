'use strict'

const roles = require('../../lib/consts/roles')
const sqlConfig = require('../../config/sql.config')
const config = require('../../config')
const R = require('ramda')

const builder = {
  build: function build (roleName) {
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
    return cfg
  }
}

module.exports = builder
