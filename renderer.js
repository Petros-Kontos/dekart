const { ipcRenderer } = require('electron');

let response;
let preIdCounter = 0;
let pIdCounter = 0;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementsByTagName('textarea')[0].focus();
});

document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementsByTagName('textarea')[0];
    textarea.addEventListener('input', function() {
        this.style.height = this.scrollHeight + 'px';
    });
})

document.getElementsByTagName('textarea')[0].addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        document.getElementsByTagName('form')[0].dispatchEvent(new Event('submit'));
    }
});

document.getElementsByTagName('form')[0].addEventListener('submit', async (event) => {
    event.preventDefault();
    const input = document.getElementsByTagName('textarea')[0].value.trim();    
    document.getElementsByTagName('textarea')[0].value = '';
    document.getElementsByTagName('textarea')[0].style.height = '50px';
    if (input === '') { return; }
    const messages = document.getElementById('messages');
    const prompt = document.createElement('p');
    prompt.textContent = input
    messages.appendChild(prompt);
    ipcRenderer.send('prompt', [{ role: 'user', content: input }]);
    response = document.createElement('div');
    messages.appendChild(response);
});

ipcRenderer.on('start-paragraph', (event, msg) => {
    const p = document.createElement('p');
    p.id = "p" + pIdCounter++;
    response.appendChild(p);
});

ipcRenderer.on('start-code-block', (event, msg) => {
    const pre = document.createElement('pre');
    pre.id = "pre" + preIdCounter++;
    response.appendChild(pre);
});

ipcRenderer.on('append-to-paragraph', (event, msg) => {
    document.getElementById("p" + (pIdCounter - 1)).textContent += msg;
});

ipcRenderer.on('append-to-code-block', (event, msg) => {
    document.getElementById("pre" + (preIdCounter - 1)).textContent += msg;
});
