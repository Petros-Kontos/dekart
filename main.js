const { app, BrowserWindow, ipcMain } = require('electron');
const { OpenAI } = require('openai');
const MODEL = 'gpt-4-1106-preview';
const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

let insideCodeBlock = false;
let expectClosingBacktick = false;
let firstMsg = false;

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
        firstMsg =true;
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
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
