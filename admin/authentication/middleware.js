function isAuthenticated (role) {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      const userRole = ((req.user).role || {})
      if (role === undefined || (role !== undefined && userRole && role === userRole)) {
        return next()
      } else {
        return res.redirect('/unauthorised')
      }
    }
    res.redirect('/sign-in')
  }
}

module.exports = isAuthenticated
