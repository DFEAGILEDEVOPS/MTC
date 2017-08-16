const config = require('../config')

const home = (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.role === 'TEACHER' || req.user.role === 'HEADTEACHER') {
      return res.redirect('/school/school-home')
    } else {
      return res.redirect('/school/school-home')
    }
  } else {
    res.redirect('/sign-in')
  }
}

const getSignIn = (req, res) => {
  res.locals.pageTitle = 'Check Development - Login'
  if (req.isAuthenticated()) {
    res.redirect('/school/school-home')
  } else {
    if (config.NCA_TOOLS_AUTH_URL) {
      res.redirect(config.NCA_TOOLS_AUTH_URL)
    } else {
      res.render('sign-in')
    }
  }
}

const postSignIn = (req, res) => {
  if (req.user.role === 'TEACHER' || req.user.role === 'HEADTEACHER') {
    return res.redirect('/school/school-home')
  } else if (req.user.role === 'TEST-DEVELOPER') {
    return res.redirect('/administrator')
  }
  res.redirect('/school/school-home')
}

const getSignOut = (req, res) => {
  req.logout()
  req.session.regenerate(function () {
    // session has been regenerated
    res.redirect('/')
  })
}

const getSignInFailure = (req, res) => {
  res.locals.pageTitle = 'Check Development App - Sign-in error'
  res.render('sign-in-failure')
}

const getProfile = (req, res) => {
  res.locals.pageTitle = 'Check Development - Profile'
  res.render('profile')
}
const postAuth = (req, res) => {
  // Please leave this in until we are confident we have identified all the NCA Tools roles.
  console.log(req.user)
  // Schools roles should redirect to school-home:
  // no mapping provided yet.
  return res.redirect('/school/school-home')
}

module.exports = {
  home,
  getSignIn,
  postSignIn,
  getSignOut,
  getSignInFailure,
  getProfile,
  postAuth
}
