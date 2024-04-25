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
const EXIT_COMMAND = 'exit';

module.exports = {
    NEWLINE,
    MODEL,
    USER,
    ASSISTANT,
    GREETING,
    FAREWELL,
    ANSI_RESET,
    ANSI_FG_WHITE_BG_GREEN,
    ANSI_FG_WHITE_BG_MAGENTA,
    ASSISTANT_HANDLE,
    USER_HANDLE,
    EXIT_COMMAND
};
