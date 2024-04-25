const OpenAI = require('openai');

const openai = new OpenAI();

async function askLM(history) {
    const stream = await openai.chat.completions.create({
        model: 'gpt-4-1106-preview',
        messages: history,
        stream: true,
    });
    return stream;
}

module.exports = { askLM }
