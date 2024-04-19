const { ipcRenderer } = require('electron');

let response;
let preIdCounter = 0;
let pIdCounter = 0;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementsByTagName('input')[0].focus();
});

document.getElementById('form').addEventListener('submit', async (event) => {
    
    event.preventDefault();
    const input = document.getElementsByTagName('input')[0].value.trim();    
    document.getElementsByTagName('input')[0].value = '';
    if (input === '') { return; }
    
    const messages = document.getElementById('messages');
    const prompt = document.createElement('p');
    prompt.textContent = input;
    messages.appendChild(prompt);
    ipcRenderer.send('prompt', [{ role: 'user', content: input }]);
    response = document.createElement('div');
    messages.appendChild(response);

    startParagraph();
});

ipcRenderer.on('backticks', (event, msg, insideCodeBlock) => {
    if (insideCodeBlock) {
        startParagraph();
    } else {
        startCodeBlock();
    }
});

ipcRenderer.on('content', (event, msg, insideCodeBlock) => {
    let container;
    if (insideCodeBlock) {
        container = document.getElementById("pre" + (preIdCounter - 1));
    } else {
        container = document.getElementById("p" + (pIdCounter - 1));
    }
    container.textContent += msg;
});

function startParagraph() {
    const p = document.createElement('p');
    p.id = "p" + pIdCounter++;
    response.appendChild(p);
}

function startCodeBlock() {
    const pre = document.createElement('pre');
    pre.id = "pre" + preIdCounter++;
    response.appendChild(pre);
}