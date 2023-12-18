import { selectFromDB, insertToDB } from './db.js';
import { NEWLINE, MODEL, USER, ASSISTANT, FAREWELL, ASSISTANT_HANDLE, USER_HANDLE, EXIT} from './constants.js';

import OpenAI from 'openai';
import readline from 'readline';

const openai = new OpenAI(); // gets API key from environment variable OPENAI_API_KEY
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

export async function repl() {
    rl.question(USER_HANDLE, async function (input) {
      if (input.trim().toLowerCase() === EXIT) {
        console.log(NEWLINE.concat(ASSISTANT_HANDLE).concat(FAREWELL).concat(NEWLINE));
        rl.close();
        return;
      }
      await insertToDB(USER, input);
      let history = await selectFromDB();
      const stream = await openai.chat.completions.create({
        model: MODEL,
        messages: history,
        stream: true,
      });
      let assistantFullResponse = '';
      process.stdout.write(NEWLINE + ASSISTANT_HANDLE);
      for await (const chunk of stream) {
        const assistantPartialResponse = chunk.choices[0]?.delta?.content || '';
        process.stdout.write(assistantPartialResponse);
        assistantFullResponse += assistantPartialResponse;
      }
      process.stdout.write(NEWLINE);
      await insertToDB(ASSISTANT, assistantFullResponse);
      repl(); // recursion
    });
}