import path from 'path'
import { app, BrowserWindow, session, shell } from 'electron'
import { is } from 'electron-util'
import _ from 'lodash'
import * as remoteMain from '@electron/remote/main'

import './init/meta'
import { load as loadDevExt } from './dev/ext'
import { loadWindowState, saveWindowState } from './initWindowState'
import './ipc/index'
import setMenu from './menu'

// Prevent window from being garbage collected
let mainWindow: BrowserWindow

declare global {
  namespace NodeJS {
    interface Global {
      mainWindow?: BrowserWindow
    }
  }
}

export async function main() {
  initAppEvents()
  await app.whenReady()

  addRequestExtraHeadersSupport()
  setMenu()
  loadDevExt()

  mainWindow = await createMainWindow()
  global.mainWindow = mainWindow

  // enable @electron/remote
  remoteMain.initialize()
  remoteMain.enable(mainWindow.webContents)

  if (process.env.NODE_ENV === 'production') {
    await mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  } else {
    await mainWindow.loadURL('http://localhost:7749')
  }
}

const createMainWindow = async () => {
  const { bounds } = await loadWindowState()

  const win = new BrowserWindow({
    title: app.name,
    show: false,
    x: bounds?.x,
    y: bounds?.y,
    width: bounds?.width,
    height: bounds?.height,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      webSecurity: false,
      spellcheck: false,
    },
  })

  win.on('ready-to-show', () => {
    win.show()
  })

  // new-window event deprecated
  win.webContents.setWindowOpenHandler(({ url }) => {
    // open url in a browser and prevent default
    shell.openExternal(url)
    return { action: 'deny' }
  })

  const preventClose = (e) => {
    e.preventDefault()
    if (win.isFullScreen()) {
      win.once('leave-full-screen', () => win.hide())
      win.setFullScreen(false) // 直接 hide 全屏窗口会导致黑屏
    } else {
      win.hide()
    }
  }
  const stopPreventClose = () => win.off('close', preventClose)

  win.on('close', preventClose)
  ;(win as any).stopPreventClose = stopPreventClose
  app.on('before-quit', stopPreventClose)

  const saveWindowStateHandler = _.throttle(() => {
    const bounds = mainWindow?.getBounds()
    if (!bounds) return
    saveWindowState({ bounds })
  }, 1000)
  win.on('resize', () => {
    saveWindowStateHandler()
  })
  win.on('move', () => {
    saveWindowStateHandler()
  })

  return win
}

function initAppEvents() {
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
    mainWindow.show()
  })

  app.on('before-quit', async () => {
    if (mainWindow) {
      try {
        await saveWindowState({
          bounds: mainWindow?.getBounds?.(),
        })
      } catch (e) {
        // noop
      }
    }
  })
}

function addRequestExtraHeadersSupport() {
  // with this, we can set user-agent in front-end
  // https://stackoverflow.com/a/35672988/2822866
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    let extraHeaders = {}
    if (details.requestHeaders['x-extra-headers']) {
      try {
        extraHeaders = JSON.parse(details.requestHeaders['x-extra-headers'])
      } catch (e) {
        // noop
      }
    }
    callback({ cancel: false, requestHeaders: { ...details.requestHeaders, ...extraHeaders } })
  })
}