const path = require('path')
const {app, BrowserWindow, Menu} = require('electron')
/// const {autoUpdater} = require('electron-updater');
const {is} = require('electron-util')
const unhandled = require('electron-unhandled')
const debug = require('electron-debug')
const contextMenu = require('electron-context-menu')
import _ from 'lodash'

import './main-process/init/meta'
const {load: loadDevExt} = require('./main-process/dev/ext')
import {loadWindowState, saveWindowState} from './main-process/initWindowState'
import menu from './main-process/menu'
import './main-process/ipc/index'

unhandled()
debug()
contextMenu()

// Uncomment this before publishing your first version.
// It's commented out as it throws an error if there are no published versions.
// if (!is.development) {
// 	const FOUR_HOURS = 1000 * 60 * 60 * 4;
// 	setInterval(() => {
// 		autoUpdater.checkForUpdates();
// 	}, FOUR_HOURS);
//
// 	autoUpdater.checkForUpdates();
// }

// Prevent window from being garbage collected
let mainWindow

const createMainWindow = async () => {
  const {bounds} = await loadWindowState()

  const win = new BrowserWindow({
    title: app.name,
    show: false,
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    },
  })

  win.on('ready-to-show', () => {
    win.show()
  })

  win.on('closed', () => {
    // Dereference the window
    mainWindow = undefined
  })

  const saveWindowStateHandler = _.throttle(() => {
    saveWindowState({bounds: mainWindow.getBounds()})
  }, 1000)
  win.on('resize', () => {
    saveWindowStateHandler()
  })
  win.on('move', () => {
    saveWindowStateHandler()
  })

  return win
}

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
  app.quit()
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }
    mainWindow.show()
  }
})

app.on('window-all-closed', () => {
  if (!is.macos) {
    app.quit()
  }
})

app.on('activate', async () => {
  if (!mainWindow) {
    mainWindow = await createMainWindow()
  }
})

app.on('before-quit', async () => {
  await saveWindowState({
    bounds: mainWindow.getBounds(),
  })
})

//
// engine: start
//

async function main() {
  await app.whenReady()
  Menu.setApplicationMenu(menu)
  loadDevExt()
  mainWindow = await createMainWindow()

  if (process.env.NODE_ENV === 'production') {
    await mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  } else {
    await mainWindow.loadURL('http://localhost:7749', {
      userAgent: 'electron',
    })
  }
}
main()
