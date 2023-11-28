#!/usr/bin/env node

import OpenAI from 'openai';
import readline from 'readline';

// gets API Key from environment variable OPENAI_API_KEY
const openai = new OpenAI();

// create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function askQuestion() {
  rl.question('\nUser: ', async function (userInput) {
    // Check if the user wants to exit the chat
    if (userInput.trim().toLowerCase() === 'exit') {
      console.log('\nDekart: Talk to you later!\n');
      rl.close();
      return;
    }

    try {
      const stream = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: userInput }],
        stream: true,
      });

      process.stdout.write('\nDekart: ');
      for await (const chunk of stream) {
        process.stdout.write(chunk.choices[0]?.delta?.content || '');
      }
      process.stdout.write('\n'); // Add a new line before prompting the user again
    } catch (error) {
      console.error('Error:', error);
    }

    askQuestion(); // Call askQuestion again to prompt for new input
  });
}

function main() {
  console.log('\nDekart: Hello, I\'m Dekart! How can I assist you today?');
  askQuestion(); // Start the input prompt loop
}

main();

