const { insertToDB, selectFromDB } = require('./db.js');
const { askLM } = require('./lm.js');

let insideCodeBlock = false;
let expectClosingBacktick = false;
let firstMsg = false;
let responseBuffer = '';

function processMsg(event, msg) {
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
    } else {
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

async function respondToPrompt(event, prompt) {
    firstMsg =true;
    try {
        await insertToDB('user', prompt);
        let history = await selectFromDB();
        const stream = await askLM(history);
        for await (const part of stream) {
            const msg = part.choices[0].delta.content;
            if (msg) {
                processMsg(event, msg);
                responseBuffer += msg;
            }
        }
        if (responseBuffer.trim() !== '') {
            await insertToDB('assistant', responseBuffer);
            responseBuffer = '';
        }
    } catch (error) {
        console.error('Error: ', error);
        throw error;
    }
}

module.exports = { respondToPrompt }