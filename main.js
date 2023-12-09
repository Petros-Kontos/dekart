#!/usr/bin/env node

import OpenAI from 'openai';
import readline from 'readline';

const MODEL = 'gpt-4-1106-preview';
const USER = 'user';
const ASSISTANT = 'assistant';
const GREETING = 'Hello! How can I help?';
const FAREWELL = 'Talk to you later!';
const ANSI_RESET = '\x1b[0m';
const ANSI_FG_WHITE_BG_GREEN = '\x1b[37;42m';
const ANSI_FG_WHITE_BG_MAGENTA = '\x1b[37;45m';
const ASSISTANT_HANDLE = ANSI_FG_WHITE_BG_MAGENTA + 'Dekart' + ANSI_RESET + ' ';
const USER_HANDLE = ANSI_FG_WHITE_BG_GREEN + 'User' + ANSI_RESET + ' ';
const EXIT = 'exit';
const NEWLINE = '\n';
const EMPTY = '';
const history = [];
const MAX_HISTORY_LENGTH = 10;
const openai = new OpenAI(); // gets API key from environment variable OPENAI_API_KEY
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function addToHistory(role, content) {
  history.push({ role, content });
  if (history.length > MAX_HISTORY_LENGTH) {
    history.shift();
  }
}

async function askQuestion() {
  rl.question(NEWLINE + USER_HANDLE, async function (userInput) {
    if (userInput.trim().toLowerCase() === EXIT) {
      console.log(NEWLINE.concat(ASSISTANT_HANDLE).concat(FAREWELL).concat(NEWLINE));
      rl.close();
      return;
    }
    addToHistory(USER, userInput);
    const stream = await openai.chat.completions.create({
      model: MODEL,
      messages: history,
      stream: true,
    });
    process.stdout.write(NEWLINE + ASSISTANT_HANDLE);
    for await (const chunk of stream) {
      const assistantResponse = chunk.choices[0]?.delta?.content || EMPTY;
      process.stdout.write(assistantResponse);
      if (assistantResponse) {
        addToHistory(ASSISTANT, assistantResponse);
      }
    }
    process.stdout.write(NEWLINE);
    askQuestion(); // recursion
  });
}

console.log(NEWLINE.concat(ASSISTANT_HANDLE).concat(GREETING));
askQuestion();
