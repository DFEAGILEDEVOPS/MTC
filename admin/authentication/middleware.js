function isAuthenticated (role) {
  console.log('ROLE', role)
  this.role = role

  return function (req, res, next) {
    console.log('THIS', this)
    console.log('ROLE(2)', this.role)
    console.log('role / req.user.role', this.role, req.user.role)
    if (typeof this.role === 'undefined') {
      console.log('ROLE IS UNDEFINED')
    }
    if (req.isAuthenticated()) {
      switch (role) {
        case undefined:
        case req.user.role === role:
          return next()
        default:
          console.log('UNAUTHORISED')
          //return res.redirect('/sign-out')
      }
    }
    res.redirect('/sign-in')
  }
}

module.exports = isAuthenticated
