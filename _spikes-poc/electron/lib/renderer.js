'use strict'

const electron = require('electron')
const shell = electron.shell
const $ = require('jquery')
const remote = electron.remote

// As this is a single page - don't open any browser windows inside electron.
// Use the default browser instead.
$(document).ready(function () {
  $(document).on('click', 'a[href^="http"]', function (event) {
    event.preventDefault()
    shell.openExternal(this.href)
  })

  $('.exit-app').on('click', function (event) {
    remote.app.quit()
  })
})
