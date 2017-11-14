const CheckForm = require('../models/check-form')
const CheckWindow = require('../models/check-window')

/**
 * Display landing page for 'test developer' role.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<void>}
 */
const getTestDeveloperHome = async (req, res, next) => {
  res.locals.pageTitle = 'MTC for test development'
  try {
    req.breadcrumbs(res.locals.pageTitle)
    res.render('test-developer/test-developer-home', {
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Display initial 'upload and view' check forms page.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
const uploadAndViewForms = async (req, res, next) => {
  res.locals.pageTitle = 'Upload and view forms'
  try {
    const forms = await CheckForm.getActiveForms().sort({createdAt: -1}).exec()
    let formData = forms.map(e => { return e.toJSON() })
    const checkWindows = await CheckWindow.getCheckWindowsAssignedToForms()

    formData.forEach(f => {
      if (checkWindows[f._id]) {
        f.checkWindows = checkWindows[f._id].map(cw => { return cw.toJSON() })
      } else {
        f.checkWindows = []
      }
    })

    req.breadcrumbs(res.locals.pageTitle)
    return res.render('test-developer/upload-and-view-forms', {
      forms: formData,
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    return next(error)
  }
}

/**
 * Remove check form.
 * @param req
 * @param res
 * @param next
 * @returns {Promise.<*>}
 */
const removeCheckForm = async (req, res, next) => {
  const id = req.params.formId
  console.log('FORM ID', id)
  try {
    const form = await CheckForm.getActiveForm(id).exec()
    if (!form) {
      return next(new Error(`Unable to find form.id [${id}]`))
    }
    // Unassign checkform from any checkwindows
    // TODO: move into model
    const checkWindowsByForm = await CheckWindow.getCheckWindowsAssignedToForms()
    if (checkWindowsByForm[form._id]) {
      // Array of CheckWindows models, each with a forms array
      let modifiedCheckWindows = []
      checkWindowsByForm[form._id].forEach(cw => {
        const index = cw.forms.indexOf(form._id)
        if (index > -1) {
          cw.forms.splice(index, 1)
          modifiedCheckWindows.push(cw)
        }
      })
      // Update any changed check windows
      const promises = modifiedCheckWindows.map(cw => { cw.save() })
      await Promise.all(promises)
    }
    await form.markAsDeleted(CheckWindow)
  } catch (error) {
    return next(error)
  }

  res.redirect('/test-developer/upload-and-view-forms')
}

const uploadCheckForm = async (req, res, next) => {
  res.locals.pageTitle = 'Upload form'
  try {
    req.breadcrumbs(res.locals.pageTitle)
    res.render('test-developer/upload-check-form', {
      breadcrumbs: req.breadcrumbs()
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getTestDeveloperHome,
  uploadAndViewForms,
  removeCheckForm,
  uploadCheckForm
}
