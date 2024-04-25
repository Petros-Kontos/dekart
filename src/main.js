const { app, BrowserWindow, ipcMain } = require('electron');
const { setupDB, insertToDB, selectFromDB } = require('./db.js');
const { askLM } = require('./lm.js');

let insideCodeBlock = false;
let expectClosingBacktick = false;
let firstMsg = false;
let responseBuffer = '';

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
    ipcMain.on('prompt', async (event, prompt) => {
        await insertToDB('user', prompt);
        let history = await selectFromDB();
        firstMsg =true;
        try {
            const stream = await askLM(history);
            for await (const part of stream) {
                const msg = part.choices[0].delta.content
                if (msg) {
                    handle(event, msg);
                    responseBuffer += msg;
                }
            }
            if (responseBuffer.trim() !== '') {
                await insertToDB('assistant', responseBuffer);
                responseBuffer = '';
            }
        } catch (error) {
            console.error('Error in OpenAI request:', error);
            throw error;
        }
    });
}

function handle(event, msg) {
    console.log('|' + msg + '|');
    if (expectClosingBacktick && msg.includes('`')) {
        expectClosingBacktick = false;
    } else if (msg === '```') {
        event.sender.send('start-code-block', null);
        insideCodeBlock = true;
    } else if (msg === '``') {
        if (insideCodeBlock) {
            event.sender.send('start-paragraph', null);
        } else {
            event.sender.send('start-code-block', null);
        }
        insideCodeBlock = !insideCodeBlock;
        expectClosingBacktick = true;
    }
        else {
        if (insideCodeBlock) {
            event.sender.send('append-to-code-block', msg);    
        } else {
            if (firstMsg) {
                event.sender.send('start-paragraph', null);
                firstMsg = false;
            }
            event.sender.send('append-to-paragraph', msg);
        }
    }
    if (msg.includes('\n') && !insideCodeBlock) {
        event.sender.send('start-paragraph', null);
    }
}

async function init() {
    await setupDB();
}
init();
app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
