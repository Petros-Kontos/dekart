#!/usr/bin/env node

import OpenAI from 'openai';
import readline from 'readline';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const NEWLINE = '\n';
const MODEL = 'gpt-4-1106-preview';
const USER = 'user';
const ASSISTANT = 'assistant';
const GREETING = 'Hello! How can I help?';
const FAREWELL = 'Talk to you later!';
const ANSI_RESET = '\x1b[0m';
const ANSI_FG_WHITE_BG_GREEN = '\x1b[37;42m';
const ANSI_FG_WHITE_BG_MAGENTA = '\x1b[37;45m';
const ASSISTANT_HANDLE = ANSI_FG_WHITE_BG_MAGENTA + 'Dekart' + ANSI_RESET + ' ';
const USER_HANDLE = NEWLINE + ANSI_FG_WHITE_BG_GREEN + 'User' + ANSI_RESET + ' ';
const EXIT = 'exit';
const DB_FILE_NAME = process.env.DEKART_DB_PATH;
const SQL_CREATE = "CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY AUTOINCREMENT, role TEXT, content TEXT)";
const SQL_SELECT = "SELECT role, content FROM history ORDER BY id DESC LIMIT 100";
const SQL_INSERT = "INSERT INTO history (role, content) VALUES (?, ?)";
const openai = new OpenAI(); // gets API key from environment variable OPENAI_API_KEY
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let db;

async function setupDB() {
  db = await open({
    filename: DB_FILE_NAME,
    driver: sqlite3.Database
  });
  await db.run(SQL_CREATE);
}

async function selectFromDB() {
  const history = await db.all(SQL_SELECT);
  return history.reverse();
}

async function insertToDB(role, content) {
  await db.run(SQL_INSERT, [role, content]);
}

async function repl() {
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

async function main() {
  console.log(NEWLINE.concat(ASSISTANT_HANDLE).concat(GREETING));
  await setupDB();
  repl();
}

main();
