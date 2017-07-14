const passport = require('passport')

const getHome = (req, res) => {
  res.locals.pageTitle = 'Multiplication Tables Check'
  if (req.isAuthenticated()) {
    res.redirect('/check/start')
  } else {
    res.redirect('/sign-in')
  }
}

const getLogger = (req, res) => {
  // logger.info({ logVars: req.query }, 'logger request')
  res.writeHead(200, {'content-type': 'text/html'})
  res.end('OK')
}

const getSignIn = (req, res) => {
  res.locals.pageTitle = 'Multiplication tables check - Login'
  res.render('sign-in-5-digit-pin', { layout: 'question-layout' }) // Temp layout
}

const postSignIn = passport.authenticate('custom', {
  failureRedirect: '/sign-in-failure',
  successRedirect: '/sign-in-success'
})

const getSignOut = (req, res) => {
  req.logout()
  req.session.regenerate(() =>
    // session has been regenerated
    res.redirect('/')
  )
}

const getSignInSucess = (req, res) => {
  res.redirect('/check/sign-in-success')
}
const getSignInFailure = (req, res) => {
  res.locals.pageTitle = 'Multiplication tables check - Sign-in error'
  res.render(`sign-in-failure-5pin`, { layout: 'question-layout' }) // Temp layout
}

const getPing = (req, res) => res.status(200).send('OK')

module.exports = {
  getHome,
  getLogger,
  getSignIn,
  postSignIn,
  getSignOut,
  getSignInSucess,
  getSignInFailure,
  getPing
}
