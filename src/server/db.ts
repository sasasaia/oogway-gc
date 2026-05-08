import pkg from 'pg';
const { Pool } = pkg;
import Database from 'better-sqlite3';

const isProduction = !!process.env.POSTGRES_URL;

let pool: any = null;
let sqliteDb: any = null;

if (isProduction) {
  pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });
} else {
  // Use better-sqlite3 for local development
  sqliteDb = new Database('oogway.db'); // local directory
  sqliteDb.pragma('journal_mode = WAL');
}

export async function query(sql: string, params: any[] = []): Promise<any[]> {
  if (isProduction) {
    const res = await pool.query(sql, params);
    return res.rows;
  } else {
    // Convert Postgres $1, $2 positional params to SQLite ? params
    const sqliteSql = sql.replace(/\$\d+/g, '?');
    const stmt = sqliteDb.prepare(sqliteSql);
    try {
      // If it's a SELECT or has RETURNING, we use .all()
      if (sqliteSql.trim().toUpperCase().startsWith('SELECT') || sqliteSql.trim().toUpperCase().includes('RETURNING')) {
        return stmt.all(...params);
      } else {
        const info = stmt.run(...params);
        return [{ id: info.lastInsertRowid, insertId: info.lastInsertRowid, changes: info.changes }];
      }
    } catch(err) {
      console.error("SQL Error. Query: ", sqliteSql, "Params: ", params, "Error: ", err);
      throw err;
    }
  }
}

export async function initDb() {
  if (isProduction) {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(255) NOT NULL,
          last_name VARCHAR(255) NOT NULL,
          username VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          avatar_url VARCHAR(1024),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await query(`
        CREATE TABLE IF NOT EXISTS follows (
            follower_id INT REFERENCES users(id) ON DELETE CASCADE,
            following_id INT REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (follower_id, following_id)
        );
    `);
    await query(`
        CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            content TEXT,
            image_url VARCHAR(1024),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    await query(`
        CREATE TABLE IF NOT EXISTS activities (
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            category VARCHAR(100),
            start_time TIMESTAMP NOT NULL,
            end_time TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    await query(`
        CREATE TABLE IF NOT EXISTS messages (
            id SERIAL PRIMARY KEY,
            sender_id INT REFERENCES users(id) ON DELETE CASCADE,
            receiver_id INT REFERENCES users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
  } else {
    // SQLite initialization
    await query(`
      CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          avatar_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await query(`
        CREATE TABLE IF NOT EXISTS follows (
            follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (follower_id, following_id)
        )
    `);
    await query(`
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            content TEXT,
            image_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    await query(`
        CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            category TEXT,
            start_time DATETIME NOT NULL,
            end_time DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    await query(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
  }
}
