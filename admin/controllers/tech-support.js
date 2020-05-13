'use strict'

const controller = {}

/**
 * Renders the tech support landing page
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {Promise<void>}
 */
controller.getHomePage = async (req, res, next) => {
  res.locals.pageTitle = 'Tech Support Homepage'
  try {
    return res.render('tech-support/home', {
      breadcrumbs: [{ name: 'Tech Support Home' }]
    })
  } catch (error) {
    return next(error)
  }
}

/**
 * Renders the check view input form
 * @param {object} req
 * @param {object} res
 * @param {function} next
 * @returns {Promise<void>}
 */
controller.getCheckViewPage = async (req, res, next, error = null) => {
  res.locals.pageTitle = 'Tech Support Check View'
  try {
    return res.render('tech-support/check-view', {
      breadcrumbs: [{ name: 'Tech Support Check View' }]
    })
  } catch (error) {
    return next(error)
  }
}

/**
 * Renders check view summary
 * @param {object} req
 * @param {object} res
 * @param {object} next
 */
controller.postCheckViewPage = async (req, res, next) => {
  const { checkCode } = req.body
  try {
    res.render('/tech-support/check-view-summary', {
      breadcrumbs: [
        { name: 'Tech Support Check View' },
        { name: 'Tech Support Check View Summary' }
      ],
      summaryData: {
        checkCode: checkCode
      }
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = controller
