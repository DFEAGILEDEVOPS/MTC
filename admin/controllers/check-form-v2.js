const checkFormPresenter = require('../helpers/check-form-presenter')
const checkFormV2Service = require('../services/check-form-v2.service')
const checkWindowV2Service = require('../services/check-window-v2.service')
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
    layout: 'gds-layout',
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
    layout: 'gds-layout',
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
    layout: 'gds-layout',
    breadcrumbs: req.breadcrumbs(),
    checkFormData
  })
}

/**
 * Assign forms view page
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
controller.getAssignFormsPage = async (req, res, next) => {
  res.locals.pageTitle = 'Assign forms to check window'
  req.breadcrumbs(res.locals.pageTitle)
  let checkWindows
  let checkWindowData
  try {
    checkWindows = await checkWindowV2Service.getPresentAndFutureCheckWindows()
    checkWindowData = checkFormPresenter.getPresentationCheckWindowListData(checkWindows)
  } catch (error) {
    return next(error)
  }
  let { hl } = req.query
  if (hl) {
    hl = JSON.parse(hl)
    hl = typeof hl === 'string' ? JSON.parse(hl) : hl
  }
  res.render('check-form/view-assign-forms-to-check-windows', {
    layout: 'gds-layout',
    breadcrumbs: req.breadcrumbs(),
    checkWindowData,
    highlight: hl && new Set(hl),
    messages: res.locals.messages
  })
}

/**
 * Select forms to be assigned to check window page
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
controller.getSelectFormPage = async (req, res, next) => {
  const checkWindowUrlSlug = req.params && req.params.checkWindowUrlSlug
  const checkFormType = req.params && req.params.checkFormType
  let checkWindow
  let checkWindowData
  let checkFormData
  let availableCheckForms
  let assignedCheckForms
  try {
    checkWindow = await checkWindowV2Service.getCheckWindow(checkWindowUrlSlug)
    availableCheckForms = await checkFormV2Service.getCheckFormsByType(checkFormType)
    assignedCheckForms = await checkFormV2Service.getCheckFormsByCheckWindowIdAndType(checkWindow, checkFormType)
    checkWindowData = checkFormPresenter.getPresentationCheckWindowData(checkWindow, checkFormType)
    checkFormData = checkFormPresenter.getPresentationAvailableFormsData(availableCheckForms, assignedCheckForms)
  } catch (error) {
    return next(error)
  }
  const hasAssignedForms = Array.isArray(assignedCheckForms) && assignedCheckForms.length > 0
  res.locals.pageTitle = `${checkWindowData.name} - ${checkWindowData.checkPeriod}`
  req.breadcrumbs('Assign forms to check windows', `/check-form/assign-forms-to-check-windows`)
  req.breadcrumbs(res.locals.pageTitle)
  res.render('check-form/view-select-forms', {
    layout: 'gds-layout',
    breadcrumbs: req.breadcrumbs(),
    checkWindowData,
    checkFormData,
    checkFormType,
    hasAssignedForms
  })
}

/**
 * Assign forms to check window
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
controller.postAssignForms = async (req, res, next) => {
  const checkWindowUrlSlug = req.params && req.params.checkWindowUrlSlug
  const checkFormType = req.params && req.params.checkFormType
  const requestData = req.body
  const { checkForms } = requestData
  let highlightMessage
  let checkWindow
  let hasAssignedFamiliarisationForm
  try {
    checkWindow = await checkWindowV2Service.getCheckWindow(checkWindowUrlSlug)
    hasAssignedFamiliarisationForm = await checkFormV2Service.hasAssignedFamiliarisationForm(checkWindow)
    if (!hasAssignedFamiliarisationForm && !checkForms && checkFormType === 'familiarisation') {
      return res.redirect(`/check-form/select-form/${checkFormType}/${checkWindowUrlSlug}`)
    }
    await checkFormV2Service.updateCheckWindowForms(checkWindow, checkFormType, checkForms)
    highlightMessage = checkFormPresenter.getAssignFormsFlashMessage(checkForms, checkWindow.name, checkFormType)
  } catch (error) {
    return next(error)
  }
  req.flash('info', highlightMessage)
  const highlight = JSON.stringify([`${checkWindowUrlSlug.toString()}-${checkFormType}`])
  return res.redirect(`/check-form/assign-forms-to-check-windows?hl=${highlight}`)
}

module.exports = controller
