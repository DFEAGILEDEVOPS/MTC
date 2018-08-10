const accessArrangementsService = require('../services/access-arrangements.service')
const pupilService = require('../services/pupil.service')
const questionReaderReasonsService = require('../services/question-reader-reasons.service')
const monitor = require('../helpers/monitor')

const controller = {}

/**
 * Acess arrangements overview
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
controller.getOverview = async (req, res, next) => {
  res.locals.pageTitle = 'Access arrangements'
  req.breadcrumbs(res.locals.pageTitle)
  return res.render('access-arrangements/overview', {
    breadcrumbs: req.breadcrumbs()
  })
}

/**
 * Select access arrangements
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
controller.getSelectAccessArrangements = async (req, res, next) => {
  res.locals.pageTitle = 'Select access arrangement for pupil'
  req.breadcrumbs('Access arrangements', '/access-arrangements/overview')
  req.breadcrumbs('Select pupils and access arrangements')
  let accessArrangements
  let questionReaderReasons
  let pupils
  try {
    accessArrangements = await accessArrangementsService.getAccessArrangements()
    questionReaderReasons = await questionReaderReasonsService.getQuestionReaderReasons()
    pupils = await pupilService.getPupilsWithFullNames(req.user.School)
  } catch (error) {
    return next(error)
  }
  return res.render('access-arrangements/select-access-arrangements', {
    breadcrumbs: req.breadcrumbs(),
    accessArrangements,
    questionReaderReasons,
    pupils
  })
}
/**
 * Submit access arrangements for single pupil
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
controller.postSubmitAccessArrangements = async (req, res, next) => {
}

module.exports = monitor('access-arrangements.controller', controller)
