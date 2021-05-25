'use strict'
const path = require('path')
const ejs = require('ejs')
const viewsDir = path.join(__dirname, '../views')
const featureToggles = require('feature-toggles')
const config = require('../config')
featureToggles.load(config.FeatureToggles)
const shouldCache = process.env.NODE_ENV === 'production'

const ejsUtil = {
  render: function ejsUtilRender (viewName, data = {}) {
    return new Promise((resolve, reject) => {
      const filename = path.join(viewsDir, viewName + '.ejs')
      data.isFeatureEnabled = (featureName) => featureToggles.isFeatureEnabled(featureName)
      // TODO: JMS: set escape to true
      ejs.renderFile(filename, data, { cache: shouldCache, escape: false },
        function (err, str) {
          if (err) return reject(err)
          return resolve(str)
        })
    })
  }
}

module.exports = ejsUtil
