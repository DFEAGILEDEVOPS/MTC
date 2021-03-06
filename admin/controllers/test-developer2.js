const checkFormPresenter = require('../helpers/check-form-presenter')
const testDeveloperService = require('../services/test-developer.service')
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
controller.getViewFormsPage = async function getViewFormsPage (req, res, next) {
  res.locals.pageTitle = 'Upload and view forms'
  let checkForms
  try {
    checkForms = await testDeveloperService.getSavedForms()
  } catch (error) {
    return next(error)
  }
  req.breadcrumbs(res.locals.pageTitle)
  return res.render('test-developer/view-forms', {
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
controller.getUploadNewFormsPage = async function getUploadNewFormsPage (req, res, next, error = null) {
  req.breadcrumbs('Upload and view forms', '/test-developer/view-forms')
  res.locals.pageTitle = 'Upload new form'
  let hasExistingFamiliarisationCheckForm
  try {
    hasExistingFamiliarisationCheckForm = await testDeveloperService.hasExistingFamiliarisationCheckForm()
  } catch (error) {
    return next(error)
  }
  req.breadcrumbs(res.locals.pageTitle)
  res.render('test-developer/upload-new-forms', {
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
controller.postUpload = async function postUpload (req, res, next) {
  const uploadData = req.files && req.files.csvFiles
  const requestData = req.body
  try {
    await testDeveloperService.saveCheckForms(uploadData, requestData)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return controller.getUploadNewFormsPage(req, res, next, error)
    }
    return next(error)
  }
  const flashMessageData = checkFormPresenter.getFlashMessageData(uploadData)
  req.flash('info', flashMessageData)
  res.redirect('/test-developer/view-forms')
}

/**
 * Delete check form
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
controller.getDelete = async function getDelete (req, res, next) {
  const urlSlug = req.params && req.params.urlSlug
  let checkFormName
  try {
    checkFormName = await testDeveloperService.getCheckFormName(urlSlug)
    await testDeveloperService.deleteCheckForm(urlSlug)
  } catch (error) {
    return next(error)
  }
  const flashMessage = { message: `Successfully deleted form ${checkFormName}` }
  req.flash('info', flashMessage)
  return res.redirect('/test-developer/view-forms')
}

/**
 * Check form view.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
controller.getViewFormPage = async function getViewFormPage (req, res, next) {
  req.breadcrumbs('Upload and view forms', '/test-developer/view-forms')
  const urlSlug = req.params && req.params.urlSlug
  let checkFormData
  try {
    checkFormData = await testDeveloperService.getCheckForm(urlSlug)
  } catch (error) {
    return next(error)
  }
  res.locals.pageTitle = checkFormData.checkFormName
  req.breadcrumbs(res.locals.pageTitle)
  res.render('test-developer/view-form', {
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
controller.getAssignFormsPage = async function getAssignFormsPage (req, res, next) {
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
  res.render('test-developer/view-assign-forms-to-check-windows', {
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
controller.getSelectFormPage = async function getSelectFormPage (req, res, next) {
  const checkWindowUrlSlug = req.params && req.params.checkWindowUrlSlug
  const checkFormType = req.params && req.params.checkFormType
  let checkWindow
  let checkWindowData
  let checkFormData
  let availableCheckForms
  let assignedCheckForms
  try {
    checkWindow = await checkWindowV2Service.getCheckWindow(checkWindowUrlSlug)
    availableCheckForms = await testDeveloperService.getCheckFormsByType(checkFormType)
    assignedCheckForms = await testDeveloperService.getCheckFormsByCheckWindowIdAndType(checkWindow, checkFormType)
    checkWindowData = checkFormPresenter.getPresentationCheckWindowData(checkWindow, checkFormType)
    checkFormData = checkFormPresenter.getPresentationAvailableFormsData(availableCheckForms, assignedCheckForms)
  } catch (error) {
    return next(error)
  }
  const hasAssignedForms = Array.isArray(assignedCheckForms) && assignedCheckForms.length > 0
  res.locals.pageTitle = `${checkWindowData.name} - ${checkWindowData.checkPeriod}`
  req.breadcrumbs('Assign forms to check windows', '/test-developer/assign-forms-to-check-windows')
  req.breadcrumbs(res.locals.pageTitle)
  res.render('test-developer/view-select-forms', {
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
controller.postAssignForms = async function postAssignForms (req, res, next) {
  const checkWindowUrlSlug = req.params && req.params.checkWindowUrlSlug
  const checkFormType = req.params && req.params.checkFormType
  const requestData = req.body
  const { checkForms } = requestData
  let highlightMessage
  let checkWindow
  let hasAssignedFamiliarisationForm
  try {
    checkWindow = await checkWindowV2Service.getCheckWindow(checkWindowUrlSlug)
    hasAssignedFamiliarisationForm = await testDeveloperService.hasAssignedFamiliarisationForm(checkWindow)
    if (!hasAssignedFamiliarisationForm && !checkForms && checkFormType === 'familiarisation') {
      return res.redirect(`/test-developer/select-form/${checkFormType}/${checkWindowUrlSlug}`)
    }
    await testDeveloperService.updateCheckWindowForms(checkWindow, checkFormType, checkForms)
    highlightMessage = checkFormPresenter.getAssignFormsFlashMessage(checkForms, checkWindow.name, checkFormType)
  } catch (error) {
    return next(error)
  }
  req.flash('info', highlightMessage)
  const highlight = JSON.stringify([`${checkWindowUrlSlug.toString()}-${checkFormType}`])
  return res.redirect(`/test-developer/assign-forms-to-check-windows?hl=${highlight}`)
}

module.exports = controller
