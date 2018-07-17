'use strict'

// empty menu
const template = []

module.exports = function (app) {
  if (process.platform === 'darwin') {
    const name = app.getName()
    template.unshift({
      label: name,
      submenu: [
        {
          label: 'Quit',
          accelerator: 'Option+Shift+Q',
          click () { app.quit() }
        }
      ]
    })
  }
  return template
}
