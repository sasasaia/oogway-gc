import sql from 'mssql';

const connectionString = import.meta.env.VITE_MSSQL_URL;

if (!connectionString) {
  console.warn("⚠️ MSSQL_URL environment variable is not defined.");
  console.warn("Please add MSSQL_URL or DATABASE_URL to your environment secrets to use the SQL Server.");
}

let poolPromise: Promise<sql.ConnectionPool> | null = null;

if (connectionString) {
  poolPromise = sql.connect(connectionString).catch(err => {
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
