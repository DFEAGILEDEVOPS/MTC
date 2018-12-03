const checkFormV2Service = require('../services/check-form-v2.service')
const ValidationError = require('../lib/validation-error')

const controller = {}

/**
 * Display initial 'upload and view' check forms page.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
controller.uploadAndViewFormsPage = async (req, res, next) => {
  res.locals.pageTitle = 'Upload and view forms'
  req.breadcrumbs(res.locals.pageTitle)
  return res.render('check-form-v2/upload-and-view-forms-v2', {
    checkForms: [],
    breadcrumbs: req.breadcrumbs()
  })
}

/**
 * Upload check form view.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
controller.uploadCheckFormPage = async (req, res, next) => {
  req.breadcrumbs('Upload and view forms', '/check-form-v2/upload-and-view-forms-v2')
  res.locals.pageTitle = 'Upload new form'
  let error
  let formData
  try {
    req.breadcrumbs(res.locals.pageTitle)
    res.render('check-form-v2/upload-new-form-v2', {
      breadcrumbs: req.breadcrumbs(),
      error: error || new ValidationError(),
      formData
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Submit check form.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
controller.submitCheckForm = async (req, res, next) => {
  const uploadedFile = req.files && req.files.csvFile
  try {
    await checkFormV2Service.submit(uploadedFile)
  } catch (error) {
    return next(error)
  }
  req.flash('info', 'File has been uploaded')
  res.redirect('/check-form-v2/upload-and-view-forms-v2')
}

module.exports = controller
