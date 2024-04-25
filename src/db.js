const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

let db;

async function setupDB() {
    db = await sqlite.open({
        filename: process.env.DEKART_DB_PATH,
        driver: sqlite3.Database
    });
    await db.run("CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY AUTOINCREMENT, role TEXT, content TEXT)");
}

async function selectFromDB() {
    const history = await db.all("SELECT role, content FROM history ORDER BY id DESC LIMIT 20");
    return history.reverse();
}

async function insertToDB(role, content) {
    await db.run("INSERT INTO history (role, content) VALUES (?, ?)", [role, content]);
}

module.exports = {
    setupDB,
    selectFromDB,
    insertToDB
};