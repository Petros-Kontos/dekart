const { app, BrowserWindow, ipcMain } = require('electron');
const { setupDB } = require('./db.js');
const { respondToPrompt } = require('./controller.js');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.loadFile('./src/index.html');
    mainWindow.maximize();
}

ipcMain.on('prompt', respondToPrompt);

app.whenReady().then(async () => {
    await setupDB();
    await createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
