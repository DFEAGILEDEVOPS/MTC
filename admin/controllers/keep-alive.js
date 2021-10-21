'use strict'

const keepAliveController = {
  keepAlive: async function (req, res) {
    let isLoggedIn = false

    if (req.user) {
      isLoggedIn = req.user && req.user.role
    }

    if (isLoggedIn) {
      return res.json({
        success: true,
        sessionExpiresAt: res.locals.sessionExpiresAt // date in milliseconds
      })
    }

    return res.status(403).json({ success: false })
  }
}

module.exports = keepAliveController
