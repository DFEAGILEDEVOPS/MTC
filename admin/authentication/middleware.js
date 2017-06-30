function isAuthenticated () {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/sign-in')
  }
}

module.exports = isAuthenticated
