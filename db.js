import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { DB_FILE_NAME, SQL_CREATE, SQL_SELECT, SQL_INSERT } from './constants.js';

let db;

export async function setupDB() {
    db = await open({
        filename: DB_FILE_NAME,
        driver: sqlite3.Database
    });
    await db.run(SQL_CREATE);
}

export async function selectFromDB() {
    const history = await db.all(SQL_SELECT);
    return history.reverse();
}

export async function insertToDB(role, content) {
    await db.run(SQL_INSERT, [role, content]);
}