import express from "express";
import { createServer as createViteServer } from "vite";
import sql from 'mssql';
import path from 'path';

// MSSQL config based on standard Vercel ENV variables
const dbConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'orb_db',
  server: process.env.DB_HOST || 'localhost',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true,
    trustServerCertificate: process.env.NODE_ENV !== 'production'
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize DB Connection
  let pool: sql.ConnectionPool | null = null;
  app.use(async (req, res, next) => {
    // Only attempt DB connection if env variables are provided
    if (process.env.DB_HOST && !pool) {
      try {
        pool = await sql.connect(dbConfig);
        console.log('Connected to MS SQL Server');
      } catch (err) {
        console.error('Database connection failed:', err);
      }
    }
    // req.db = pool;
    next();
  });

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Posts
  app.get("/api/posts", async (req, res) => {
    try {
      if (!pool) return res.json({ posts: 
        // Mock data when DB is not connected
        [
          { id: 1, author: 'Alice', content: 'Just joined Orb!', createdAt: new Date().toISOString(), image: null },
          { id: 2, author: 'Bob', content: 'Happy to be here.', createdAt: new Date().toISOString(), image: null }
        ] 
      });
      
      const result = await pool.request().query('SELECT * FROM Posts ORDER BY CreatedAt DESC');
      res.json({ posts: result.recordset });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const { content, image, author } = req.body;
      if (!pool) return res.json({ success: true, message: 'Mock post created' });
      
      const request = pool.request();
      request.input('author', sql.NVarChar, author || 'Anonymous');
      request.input('content', sql.NVarChar, content || '');
      request.input('image', sql.VarChar, image || null); // Base64 string
      
      // We assume table Posts(Id INT IDENTITY, Author NVARCHAR, Content NVARCHAR, Image VARCHAR(MAX), CreatedAt DATETIME)
      await request.query(`
        INSERT INTO Posts (Author, Content, Image, CreatedAt)
        VALUES (@author, @content, @image, GETDATE())
      `);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Events
  app.get("/api/events", async (req, res) => {
    try {
      if (!pool) return res.json({ events: [
        { id: 1, title: 'Server Launch Party', date: new Date().toISOString(), visibility: 'public' }
      ] });
      
      const result = await pool.request().query('SELECT * FROM Events ORDER BY EventDate ASC');
      res.json({ events: result.recordset });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });
  
  app.post("/api/events", async (req, res) => {
    try {
      const { title, date, visibility } = req.body;
      if (!pool) return res.json({ success: true, message: 'Mock event created' });
      
      const request = pool.request();
      request.input('title', sql.NVarChar, title || 'New Event');
      request.input('date', sql.DateTime, new Date(date));
      request.input('visibility', sql.NVarChar, visibility || 'public');
      
      await request.query(`
        INSERT INTO Events (Title, EventDate, Visibility, CreatedAt)
        VALUES (@title, @date, @visibility, GETDATE())
      `);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Note: for typical Vercel deployment, Vercel handles static files and serverless functions separately.
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
