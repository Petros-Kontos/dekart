import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

import { DB_FILE_NAME, SQL_CREATE, SQL_SELECT, SQL_INSERT } from './constants.js';

let db;

export async function setupDB() {
    db = await open({
        filename: DB_FILE_NAME,
        driver: sqlite3.Database
    });
    await db.run("CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY AUTOINCREMENT, role TEXT, content TEXT)");
}

export async function selectFromDB() {
    const history = await db.all("SELECT role, content FROM history ORDER BY id DESC LIMIT 100");
    return history.reverse();
}

export async function insertToDB(role, content) {
    await db.run("INSERT INTO history (role, content) VALUES (?, ?)", [role, content]);
}
