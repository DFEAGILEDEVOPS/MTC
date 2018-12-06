const ValidationError = require('../lib/validation-error')

const controller = {}

/**
 * Display initial 'upload and view' check forms page.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
controller.getViewFormsPage = async (req, res, next) => {
  res.locals.pageTitle = 'Upload and view forms'
  req.breadcrumbs(res.locals.pageTitle)
  return res.render('check-form/upload-and-view-forms', {
    checkForms: [],
    breadcrumbs: req.breadcrumbs()
  })
}

/**
 * Upload check form(s) view.
 * @param req
 * @param res
 * @param next
 * @param error
 * @returns {Promise.<void>}
 */
controller.getUploadNewFormsPage = async (req, res, next, error) => {
  req.breadcrumbs('Upload and view forms', '/check-form/upload-and-view-forms')
  res.locals.pageTitle = 'Upload new form'
  try {
    req.breadcrumbs(res.locals.pageTitle)
    res.render('check-form/upload-new-form', {
      breadcrumbs: req.breadcrumbs(),
      error: error || new ValidationError(),
      formData: req.body
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Upload check form(s).
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
controller.postUpload = async (req, res, next) => {
  // This is placeholder method
  res.redirect('/check-form/upload-and-view-forms')
}

module.exports = controller
