'use strict'

const moment = require('moment')
const monitor = require('../helpers/monitor')

const controller = {

  /**
   * Returns check windows hub page
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  getManageCheckWindows: async (req, res, next) => {
    res.locals.pageTitle = 'Manage check windows'
    req.breadcrumbs(res.locals.pageTitle)
    return res.render('check-window/manage-check-windows', {
      breadcrumbs: req.breadcrumbs()
    })
  },

  /**
   * Create new check window
   * @param req
   * @param res
   * @param next
   * @returns {Promise.<void>}
   */
  createCheckWindow: async (req, res, next) => {
    res.locals.pageTitle = 'Create check window'
    req.breadcrumbs('Manage check windows', '/check-window/manage-check-windows')
    req.breadcrumbs(res.locals.pageTitle)
    return res.render('check-window/create-check-window', {
      breadcrumbs: req.breadcrumbs(),
      currentYear: moment().format('YYYY')
    })
  }
}

module.exports = monitor('service-manager.controller', controller)
