#!/usr/bin/env node

import OpenAI from 'openai';
import readline from 'readline';

const MODEL = 'gpt-4-1106-preview';
const USER = 'user';
const GREETING = 'Hello! How can I help?';
const FAREWELL = 'Talk to you later!';
const ASSISTANT_HANDLE = 'Dekart: ';
const USER_HANDLE = 'User: ';
const EXIT = 'exit';
const NEWLINE = '\n';
const EMPTY = '';
const openai = new OpenAI(); // gets API key from environment variable OPENAI_API_KEY
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askQuestion() {
  rl.question(NEWLINE + USER_HANDLE, async function (userInput) {
    if (userInput.trim().toLowerCase() === EXIT) {
      console.log(NEWLINE.concat(ASSISTANT_HANDLE).concat(FAREWELL).concat(NEWLINE));
      rl.close();
      return;
    }
    const stream = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: USER, content: userInput }],
      stream: true,
    });
    process.stdout.write(NEWLINE + ASSISTANT_HANDLE);
    for await (const chunk of stream) {
      process.stdout.write(chunk.choices[0]?.delta?.content || EMPTY);
    }
    process.stdout.write(NEWLINE);
    askQuestion(); // recursion
  });
}

console.log(NEWLINE.concat(ASSISTANT_HANDLE).concat(GREETING));
askQuestion();
