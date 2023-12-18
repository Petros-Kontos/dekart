import readline from 'readline';
import { askLM } from './lm.js';
import { selectFromDB, insertToDB } from './db.js';
import { NEWLINE, USER, ASSISTANT, FAREWELL, ASSISTANT_HANDLE, USER_HANDLE, EXIT_COMMAND } from './constants.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

export async function repl() {
  rl.question(USER_HANDLE, async function (input) {
    if (input.trim().toLowerCase() === EXIT_COMMAND) {
      console.log(NEWLINE.concat(ASSISTANT_HANDLE).concat(FAREWELL).concat(NEWLINE));
      rl.close();
      return;
    }
    await insertToDB(USER, input);
    let history = await selectFromDB();
    const stream = await askLM(history);
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
