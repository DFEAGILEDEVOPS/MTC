'use strict'
const electron = require('electron')
const dns = require('dns')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const applicationMenu = require('./application-menu')(app)
const Menu = electron.Menu
const path = require('path')

let mainWindow = null

// This setting is needed for OSX in a VM on parallels (12.x)
// Looks like a bug in parallels.
// app.disableHardwareAcceleration();

app.on('ready', () => {
  const menu = Menu.buildFromTemplate(applicationMenu)
  const errorUrl = 'file:///' + __dirname + '/../app/error.html'                 // eslint-disable-line no-path-concat
  const installationUrl = 'file:///' + __dirname + '/../app/installation.html'   // eslint-disable-line no-path-concat
  const trialOverUrl = 'file:///' + __dirname + '/../app/trial-over.html'        // eslint-disable-line no-path-concat

  Menu.setApplicationMenu(menu)
  /**
   * Options:
   * kiosk - launch the browser more securely in full screen
   * nodeIntegration - this allows jQuery to be loaded.  Also see:
   * https://stackoverflow.com/questions/32621988/electron-jquery-is-not-defined
   * for other solutions
   *
   * @type {Electron.BrowserWindow}
   */
  mainWindow = new BrowserWindow({
    kiosk: true,
    fullscreen: true,
    frame: false,
    icon: path.join(__dirname, '/../assets/icons/png/64x64.png')
  })

  dns.resolveTxt('mtcelectron.ovix.uk', function (err, txtRecord) {
    if (err) {
      return mainWindow.loadURL(errorUrl)
    }
    const response = txtRecord[0][0]
    // const response = 'http://localhost:3000';
    if (response.match(/^http/i)) {
      return mainWindow.loadURL(response)
    } else if (response === 'installation') {
      return mainWindow.loadURL(installationUrl)
    } else if (response === 'trial-over') {
      return mainWindow.loadURL(trialOverUrl)
    } else {
      return mainWindow.loadURL(errorUrl)
    }
  })

  mainWindow.on('close', () => {
    // Delete all cookies
    if (mainWindow) {
      // console.log("mainWindow.on('close'): session deleted");
      mainWindow.webContents.session.clearStorageData()
    }
  })

  // Dev only
  // mainWindow.webContents.openDevTools()
})

app.on('will-quit', () => {
  // Delete all cookies
  if (mainWindow) {
    // console.log("app.on('will-quit'): session deleted");
    mainWindow.webContents.session.clearStorageData()
  }
})
