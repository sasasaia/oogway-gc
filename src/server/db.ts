import sql from 'mssql';

const connectionString = process.env.MSSQL_URL || process.env.DATABASE_URL;

const dbConfig: sql.config | string | undefined = connectionString || (process.env.DB_SERVER && process.env.DB_USER && process.env.DB_PASSWORD ? {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || '',
    server: process.env.DB_SERVER,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    },
    options: {
      encrypt: true, // for modern Azure SQL and others
      trustServerCertificate: process.env.DB_TRUST_CERT === 'true' // change to true for local dev / self-signed certs
    }
} : undefined);

if (!dbConfig) {
  console.warn("⚠️ Database connection variables missing.");
  console.warn("Please provide either MSSQL_URL or separate DB_SERVER, DB_USER, DB_PASSWORD, DB_NAME variables.");
}

let poolPromise: Promise<sql.ConnectionPool> | null = null;

if (dbConfig) {
  poolPromise = sql.connect(dbConfig).catch(err => {
      console.error("Database Connection Failed! Bad Config: ", err);
      throw err;
  });
}

export async function query(sqlQuery: string, params: any[] = []): Promise<any[]> {
  if (!poolPromise) {
    throw new Error("Database not connected. Please set MSSQL_URL environment variable.");
  }
  const pool = await poolPromise;
  
  try {
    const request = pool.request();
    params.forEach((param, index) => {
      request.input(`p${index + 1}`, param);
    });
    
    const result = await request.query(sqlQuery);
    return result.recordset || [];
  } catch (err) {
    console.error("SQL Error. Query:", sqlQuery, "Params:", params, "Error:", err);
    throw err;
  }
}

export async function initDb() {
  if (!poolPromise) return;
  const pool = await poolPromise;

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' and xtype='U')
    CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(1024),
        created_at DATETIME DEFAULT GETDATE()
    );
  `);
  await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='follows' and xtype='U')
      CREATE TABLE follows (
          follower_id INT REFERENCES users(id) ON DELETE NO ACTION,
          following_id INT REFERENCES users(id) ON DELETE NO ACTION,
          created_at DATETIME DEFAULT GETDATE(),
          PRIMARY KEY (follower_id, following_id)
      );
  `);
  await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='posts' and xtype='U')
      CREATE TABLE posts (
          id INT IDENTITY(1,1) PRIMARY KEY,
          user_id INT REFERENCES users(id) ON DELETE CASCADE,
          content TEXT,
          image_url VARCHAR(1024),
          created_at DATETIME DEFAULT GETDATE()
      );
  `);
  await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='activities' and xtype='U')
      CREATE TABLE activities (
          id INT IDENTITY(1,1) PRIMARY KEY,
          user_id INT REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          category VARCHAR(100),
          start_time DATETIME NOT NULL,
          end_time DATETIME NOT NULL,
          created_at DATETIME DEFAULT GETDATE()
      );
  `);
  await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='messages' and xtype='U')
      CREATE TABLE messages (
          id INT IDENTITY(1,1) PRIMARY KEY,
          sender_id INT REFERENCES users(id) ON DELETE NO ACTION,
          receiver_id INT REFERENCES users(id) ON DELETE NO ACTION,
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT GETDATE()
      );
  `);
  console.log("SQL Database initialized successfully.");
}
