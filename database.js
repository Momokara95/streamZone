const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'streamzone.db');

let db = null;

async function initDatabase() {
    const SQL = await initSqlJs();
    
    // Load or create database
    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    // Create tables
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            avatar TEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            content_id TEXT NOT NULL,
            content_type TEXT NOT NULL,
            title TEXT NOT NULL,
            poster_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            content_id TEXT NOT NULL,
            content_type TEXT NOT NULL,
            title TEXT NOT NULL,
            poster_url TEXT,
            watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS custom_lists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS list_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            list_id INTEGER NOT NULL,
            content_id TEXT NOT NULL,
            content_type TEXT NOT NULL,
            title TEXT NOT NULL,
            poster_url TEXT,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (list_id) REFERENCES custom_lists(id) ON DELETE CASCADE
        )
    `);

    saveDatabase();
    console.log('✅ Database initialized successfully');
    
    return db;
}

function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
    }
}

// Wrapper functions for database operations
const dbWrapper = {
    prepare(sql) {
        return {
            run(...params) {
                db.run(sql, params);
                saveDatabase();
                return { lastInsertRowid: db.exec("SELECT last_insert_rowid()")[0]?.values[0][0] };
            },
            get(...params) {
                const stmt = db.prepare(sql);
                stmt.bind(params);
                if (stmt.step()) {
                    const row = stmt.getAsObject();
                    stmt.free();
                    return row;
                }
                stmt.free();
                return undefined;
            },
            all(...params) {
                const results = [];
                const stmt = db.prepare(sql);
                stmt.bind(params);
                while (stmt.step()) {
                    results.push(stmt.getAsObject());
                }
                stmt.free();
                return results;
            }
        };
    },
    exec(sql) {
        db.run(sql);
        saveDatabase();
    },
    pragma(str) {
        db.run(`PRAGMA ${str}`);
    }
};

module.exports = { initDatabase, db: dbWrapper, saveDatabase };
