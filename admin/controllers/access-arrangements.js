const accessArrangementsService = require('../services/access-arrangements.service')
const pupilAccessArrangementsService = require('../services/pupil-access-arrangements.service')
const pupilService = require('../services/pupil.service')
const questionReaderReasonsService = require('../services/question-reader-reasons.service')
const monitor = require('../helpers/monitor')
const ValidationError = require('../lib/validation-error')

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
  let pupils
  try {
    pupils = await pupilAccessArrangementsService.getPupils(req.user.School)
  } catch (error) {
    return next(error)
  }
  const { hl } = req.query
  return res.render('access-arrangements/overview', {
    highlight: hl,
    messages: res.locals.messages,
    breadcrumbs: req.breadcrumbs(),
    pupils
  })
}

/**
 * Select access arrangements
 * @param req
 * @param res
 * @param next
 * @param error
 * @returns {Promise.<void>}
 */
controller.getSelectAccessArrangements = async (req, res, next, error = null) => {
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
    pupils,
    formData: req.body,
    error: error || new ValidationError()
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
  let pupil
  try {
    pupil = await accessArrangementsService.submit(req.body, req.user.School, req.user.id)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return controller.getSelectAccessArrangements(req, res, next, error)
    }
    return next(error)
  }
  req.flash('info', `Access arrangements applied to ${pupil.lastName}, ${pupil.foreName}`)
  return res.redirect(`/access-arrangements/overview?hl=${pupil.urlSlug}`)
}

module.exports = monitor('access-arrangements.controller', controller)
