#!/usr/bin/env node

import { setupDB } from './db.js';
import { repl } from './repl.js';
import { NEWLINE, GREETING, ASSISTANT_HANDLE } from './constants.js';

async function main() {
  console.log(NEWLINE.concat(ASSISTANT_HANDLE).concat(GREETING));
  await setupDB();
  repl();
}

main();
