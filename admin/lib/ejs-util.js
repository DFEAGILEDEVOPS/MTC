'use strict'
const path = require('path')
const ejs = require('ejs')
const viewsDir = path.join(__dirname, '../views')

const ejsUtil = {
  render: function ejsUtilRender (viewName, data = {}) {
    return new Promise((resolve, reject) => {
      const filename = path.join(viewsDir, viewName + '.ejs')
      ejs.renderFile(filename, data, { cache: true, escape: false },
        function (err, str) {
          if (err) return reject(err)
          return resolve(str)
        })
    })
  }
}

module.exports = ejsUtil
