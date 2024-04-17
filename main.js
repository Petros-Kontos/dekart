const { app, BrowserWindow, ipcMain } = require('electron');
const { OpenAI } = require('openai');
const MODEL = 'gpt-4-1106-preview';
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
            // enableRemoteModule: true
        }
    });
    mainWindow.loadFile('index.html');
    mainWindow.maximize();
    ipcMain.on('userMessage', async (event, history) => {
        try {
            const stream = await openai.chat.completions.create({
                model: MODEL,
                messages: history,
                stream: true
            });
            for await (const part of stream) {
                if (part.choices && 
                    part.choices[0] && 
                    part.choices[0].delta && 
                    part.choices[0].delta.content) {
                    event.sender.send(
                                    'llmMessage', 
                                    part.choices[0].delta.content
                    );
                }
            }
        } catch (error) {
            console.error('Error in OpenAI request:', error);
            throw error;
        }
    });
}
app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
