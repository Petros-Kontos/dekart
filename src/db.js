import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

export async function setupDB() {
    db = await open({
        filename: process.env.DEKART_DB_PATH,
        driver: sqlite3.Database
    });
    await db.run("CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY AUTOINCREMENT, role TEXT, content TEXT)");
}

export async function selectFromDB() {
    const history = await db.all("SELECT role, content FROM history ORDER BY id DESC LIMIT 10");
    return history.reverse();
}

export async function insertToDB(role, content) {
    await db.run("INSERT INTO history (role, content) VALUES (?, ?)", [role, content]);
}
