import OpenAI from 'openai';
import { MODEL} from './constants.js';

const openai = new OpenAI();

export async function askLM(history) {
    const stream = await openai.chat.completions.create({
        model: MODEL,
        messages: history,
        stream: true,
    });
    return stream;
}
