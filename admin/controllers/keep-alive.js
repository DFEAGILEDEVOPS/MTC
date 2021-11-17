'use strict'

const keepAliveController = {
  keepAlive: async function (req, res) {
    if (req.isAuthenticated()) {
      return res.json({
        success: true,
        sessionExpiresAt: res.locals.sessionExpiresAt // date in milliseconds
      })
    }

    return res.status(403).json({ success: false })
  }
}

module.exports = keepAliveController
