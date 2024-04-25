const OpenAI = require('openai');
const { MODEL } = require('./constants.js');

const openai = new OpenAI();

async function askLM(history) {
    const stream = await openai.chat.completions.create({
        model: MODEL,
        messages: history,
        stream: true,
    });
    return stream;
}

module.exports = { askLM }
