const { app, BrowserWindow, ipcMain } = require('electron');

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
		height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadFile('index.html')

	win.webContents.on('did-finish-load', () => {
		const b = win.getContentBounds()
		win.webContents.send('window-position', [b.x, b.y])
	})
	
	win.on('move', (e) => {
		const b = e.sender.getContentBounds()
		win.webContents.send('window-position', [b.x, b.y])
	});
/*
	const tick = function() {
		const b = win.getContentBounds()
		console.log([b.x, b.y])

		setImmediate(tick)
	}

	tick();*/
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

