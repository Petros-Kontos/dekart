const { ipcRenderer } = require('electron');

let response;

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('prompt');
    if (input) {
        input.focus();
    }
});

document.getElementById('form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const prompt = document.getElementById('prompt').value.trim();
    document.getElementById('prompt').value = '';
    if (prompt === '') {return;}
    const messages = document.getElementById('messages');
    const promptDiv = document.createElement('div');
    promptDiv.textContent = prompt;
    promptDiv.className = 'promptDiv';
    messages.appendChild(promptDiv);
    const history = [{ role: 'user', content: prompt }];
    ipcRenderer.send('userMessage', history);
    response = document.createElement('div');
    messages.appendChild(response);
});

ipcRenderer.on('llmMessage', (event, message) => {
    if (response) {
        response.textContent += message;
    }
});