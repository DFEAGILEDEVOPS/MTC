const checkFormPresenter = require('../helpers/check-form-presenter')
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
controller.getViewFormsPage = async (req, res, next) => {
  res.locals.pageTitle = 'Upload and view forms'
  let checkForms
  try {
    checkForms = await checkFormV2Service.getSavedForms()
  } catch (error) {
    return next(error)
  }
  req.breadcrumbs(res.locals.pageTitle)
  return res.render('check-form/view-forms', {
    checkForms,
    breadcrumbs: req.breadcrumbs(),
    messages: res.locals.messages
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
controller.getUploadNewFormsPage = async (req, res, next, error = null) => {
  req.breadcrumbs('Upload and view forms', '/check-form/view-forms')
  res.locals.pageTitle = 'Upload new form'
  let hasExistingFamiliarisationCheckForm
  try {
    hasExistingFamiliarisationCheckForm = await checkFormV2Service.hasExistingFamiliarisationCheckForm()
  } catch (error) {
    return next(error)
  }
  req.breadcrumbs(res.locals.pageTitle)
  res.render('check-form/upload-new-forms', {
    breadcrumbs: req.breadcrumbs(),
    errors: error || new ValidationError(),
    formData: req.body,
    hasExistingFamiliarisationCheckForm
  })
}

/**
 * Upload check form(s).
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
controller.postUpload = async (req, res, next) => {
  const uploadData = req.files && req.files.csvFiles
  const requestData = req.body
  try {
    await checkFormV2Service.saveCheckForms(uploadData, requestData)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return controller.getUploadNewFormsPage(req, res, next, error)
    }
    return next(error)
  }
  const flashMessageData = checkFormPresenter.getFlashMessageData(uploadData)
  req.flash('info', flashMessageData)
  res.redirect('/check-form/view-forms')
}

/**
 * Delete check form
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
controller.getDelete = async (req, res, next) => {
  const urlSlug = req.params && req.params.urlSlug
  let checkFormName
  try {
    checkFormName = await checkFormV2Service.getCheckFormName(urlSlug)
    await checkFormV2Service.deleteCheckForm(urlSlug)
  } catch (error) {
    return next(error)
  }
  const flashMessage = { message: `Successfully deleted form ${checkFormName}` }
  req.flash('info', flashMessage)
  return res.redirect(`/check-form/view-forms`)
}

/**
 * Check form view.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
controller.getViewFormPage = async (req, res, next) => {
  req.breadcrumbs(`Upload and view forms`, `/check-form/view-forms`)
  const urlSlug = req.params && req.params.urlSlug
  let checkFormData
  try {
    checkFormData = await checkFormV2Service.getCheckForm(urlSlug)
  } catch (error) {
    return next(error)
  }
  res.locals.pageTitle = checkFormData.checkFormName
  req.breadcrumbs(res.locals.pageTitle)
  res.render('check-form/view-form', {
    breadcrumbs: req.breadcrumbs(),
    checkFormData
  })
}

module.exports = controller
