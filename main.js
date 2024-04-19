const { app, BrowserWindow, ipcMain } = require('electron');
const { OpenAI } = require('openai');
const MODEL = 'gpt-4-1106-preview';
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

let expectSingleBacktick = false;
let insideCodeBlock = false;

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 600,
        // frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
            // enableRemoteModule: true
        }
    });
    mainWindow.loadFile('index.html');
    mainWindow.maximize();
    ipcMain.on('prompt', async (event, history) => {
        try {
            const stream = await openai.chat.completions.create({
                model: MODEL,
                messages: history,
                stream: true
            });
            for await (const part of stream) {
                handle(event, part.choices[0].delta.content);
            }
        } catch (error) {
            console.error('Error in OpenAI request:', error);
            throw error;
        }
    });
}

function handle(event, msg) {
    if (msg) {
        console.log('|' + msg + '|');
        if (expectSingleBacktick) {
            expectSingleBacktick = false;
        } else if (msg === '```') {
            languageIdentifier = true;
            event.sender.send('backticks', null, false);
            insideCodeBlock = true;
        } else if (msg === '``') {
            expectSingleBacktick = true;
            event.sender.send('backticks', null, insideCodeBlock);
            insideCodeBlock = !insideCodeBlock;
        } else {
            event.sender.send('content', msg, insideCodeBlock);
        }
    }
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
