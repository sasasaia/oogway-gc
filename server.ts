import express from "express";
import { createServer as createViteServer } from "vite";
import sql from 'mssql';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_change_me';

// Define a type for extending Express Request
declare global {
  namespace Express {
    interface Request {
      db?: sql.ConnectionPool;
      user?: { id: number, username: string };
    }
  }
}

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
    req.db = pool;
    next();
  });

  // Auth Middleware
  const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: 'Invalid token' });
      req.user = user as { id: number, username: string };
      next();
    });
  };

  // API endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // --- Auth --- //
  app.post("/api/register", async (req, res) => {
    try {
      const { username, email, password, firstName, lastName } = req.body;
      if (!username || !email || !password || !firstName || !lastName) return res.status(400).json({ error: 'Missing fields' });
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      if (!pool) return res.json({ token: jwt.sign({ id: 1, username }, JWT_SECRET), user: { id: 1, username, firstName, lastName } });

      const request = pool.request();
      request.input('username', sql.NVarChar, username);
      request.input('email', sql.NVarChar, email);
      request.input('password', sql.NVarChar, hashedPassword);
      request.input('firstName', sql.NVarChar, firstName);
      request.input('lastName', sql.NVarChar, lastName);
      
      const result = await request.query(`
        INSERT INTO Users (Username, Email, PasswordHash, FirstName, LastName)
        OUTPUT INSERTED.Id, INSERTED.Username, INSERTED.Email, INSERTED.FirstName, INSERTED.LastName
        VALUES (@username, @email, @password, @firstName, @lastName)
      `);
      
      const user = result.recordset[0];
      const token = jwt.sign({ id: user.Id, username: user.Username }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.Id, username: user.Username, email: user.Email, firstName: user.FirstName, lastName: user.LastName } });
    } catch (err: any) {
      if (err.message?.includes('Violation of UNIQUE KEY constraint')) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }
      res.status(500).json({ error: String(err) });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!pool) return res.json({ token: jwt.sign({ id: 1, username: username || 'MockUser' }, JWT_SECRET), user: { id: 1, username: username || 'MockUser' } });

      const request = pool.request();
      request.input('username', sql.NVarChar, username);
      const result = await request.query(`SELECT * FROM Users WHERE Username = @username OR Email = @username`);
      
      if (result.recordset.length === 0) return res.status(400).json({ error: 'User not found' });
      
      const user = result.recordset[0];
      const validPass = await bcrypt.compare(password, user.PasswordHash);
      if (!validPass) return res.status(400).json({ error: 'Invalid password' });
      
      const token = jwt.sign({ id: user.Id, username: user.Username }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.Id, username: user.Username, email: user.Email, firstName: user.FirstName, lastName: user.LastName, avatar: user.Avatar } });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.get("/api/me", authenticateToken, async (req, res) => {
    try {
      if (!pool) return res.json({ user: { id: req.user!.id, username: req.user!.username, firstName: 'Mock', lastName: 'User', avatar: null, bio: 'Mock User', location: 'Earth', website: '' } });

      const request = pool.request();
      request.input('id', sql.Int, req.user!.id);
      const result = await request.query('SELECT Id, Username, Email, FirstName, LastName, Avatar, Bio, Location, Website, CreatedAt FROM Users WHERE Id = @id');
      
      if (result.recordset.length === 0) return res.status(404).json({ error: 'User not found' });
      res.json({ user: result.recordset[0] });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.put("/api/profile", authenticateToken, async (req, res) => {
    try {
      const { avatar, bio, location, website } = req.body;
      if (!pool) return res.json({ success: true, message: 'Profile updated' });

      const request = pool.request();
      request.input('id', sql.Int, req.user!.id);
      request.input('avatar', sql.VarChar, avatar || null);
      request.input('bio', sql.NVarChar, bio || null);
      request.input('location', sql.NVarChar, location || null);
      request.input('website', sql.NVarChar, website || null);

      await request.query(`
        UPDATE Users 
        SET Avatar = ISNULL(@avatar, Avatar), 
            Bio = ISNULL(@bio, Bio), 
            Location = ISNULL(@location, Location), 
            Website = ISNULL(@website, Website)
        WHERE Id = @id
      `);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // --- Users --- //
  app.get("/api/users", authenticateToken, async (req, res) => {
    try {
      if (!pool) return res.json({ users: [{ Id: 2, Username: 'Friend 1', Avatar: null }, { Id: 3, Username: 'Friend 2', Avatar: null }] });
      const result = await pool.request().query('SELECT Id, Username, Avatar FROM Users WHERE Id != ' + req.user!.id);
      res.json({ users: result.recordset });
    } catch(err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // --- Posts --- //
  app.get("/api/posts", authenticateToken, async (req, res) => {
    try {
      if (!pool) return res.json({ posts: 
        [
          { id: 1, userId: 1, author: 'Alice', content: 'Just joined Orb!', createdAt: new Date().toISOString(), image: null, avatar: null },
        ] 
      });
      
      const result = await pool.request().query(`
        SELECT p.Id as id, p.Content as content, p.Image as image, p.CreatedAt as createdAt, 
               u.Username as author, u.Avatar as avatar, u.Id as userId
        FROM Posts p
        JOIN Users u ON p.UserId = u.Id
        ORDER BY p.CreatedAt DESC
      `);
      res.json({ posts: result.recordset });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.post("/api/posts", authenticateToken, async (req, res) => {
    try {
      const { content, image } = req.body;
      if (!pool) return res.json({ success: true, message: 'Mock post created' });
      
      const request = pool.request();
      request.input('userId', sql.Int, req.user!.id);
      request.input('content', sql.NVarChar, content || '');
      request.input('image', sql.VarChar, image || null);
      
      await request.query(`
        INSERT INTO Posts (UserId, Content, Image, CreatedAt)
        VALUES (@userId, @content, @image, GETDATE())
      `);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // --- Events --- //
  app.get("/api/events", authenticateToken, async (req, res) => {
    try {
      if (!pool) return res.json({ events: [
        { id: 1, title: 'Server Launch Party', date: new Date().toISOString(), visibility: 'public' }
      ] });
      
      const result = await pool.request().query(`
        SELECT e.Id as id, e.Title as title, e.EventDate as date, e.Visibility as visibility,
               u.Username as author
        FROM Events e
        JOIN Users u ON e.UserId = u.Id
        ORDER BY e.EventDate ASC
      `);
      res.json({ events: result.recordset });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });
  
  app.post("/api/events", authenticateToken, async (req, res) => {
    try {
      const { title, date, visibility } = req.body;
      if (!pool) return res.json({ success: true, message: 'Mock event created' });
      
      const request = pool.request();
      request.input('userId', sql.Int, req.user!.id);
      request.input('title', sql.NVarChar, title || 'New Event');
      request.input('date', sql.DateTime, new Date(date));
      request.input('visibility', sql.NVarChar, visibility || 'public');
      
      await request.query(`
        INSERT INTO Events (UserId, Title, EventDate, Visibility, CreatedAt)
        VALUES (@userId, @title, @date, @visibility, GETDATE())
      `);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // --- Messages --- //
  app.get("/api/messages/:otherUserId", authenticateToken, async (req, res) => {
    try {
      const otherUserId = parseInt(req.params.otherUserId);
      if (!pool) return res.json({ messages: [
        { id: 1, senderId: otherUserId, content: "Hey!", createdAt: new Date().toISOString() }
      ] });

      const request = pool.request();
      request.input('userId', sql.Int, req.user!.id);
      request.input('otherId', sql.Int, otherUserId);

      const result = await request.query(`
        SELECT Id as id, SenderId as senderId, ReceiverId as receiverId, Content as content, CreatedAt as createdAt
        FROM Messages
        WHERE (SenderId = @userId AND ReceiverId = @otherId)
           OR (SenderId = @otherId AND ReceiverId = @userId)
        ORDER BY CreatedAt ASC
      `);
      res.json({ messages: result.recordset });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.post("/api/messages", authenticateToken, async (req, res) => {
    try {
      const { receiverId, content } = req.body;
      if (!pool) return res.json({ success: true });

      const request = pool.request();
      request.input('senderId', sql.Int, req.user!.id);
      request.input('receiverId', sql.Int, receiverId);
      request.input('content', sql.NVarChar, content);
      
      await request.query(`
        INSERT INTO Messages (SenderId, ReceiverId, Content, CreatedAt)
        VALUES (@senderId, @receiverId, @content, GETDATE());
        
        INSERT INTO Notifications (UserId, Content, IsRead, CreatedAt)
        VALUES (@receiverId, 'New message from ' + (SELECT Username FROM Users WHERE Id = @senderId), 0, GETDATE());
      `);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // --- Notifications --- //
  app.get("/api/notifications", authenticateToken, async (req, res) => {
    try {
      if (!pool) return res.json({ notifications: [ { id: 1, content: "Welcome to Orb!", isRead: false, createdAt: new Date().toISOString() } ] });

      const request = pool.request();
      request.input('userId', sql.Int, req.user!.id);
      
      const result = await request.query(`
        SELECT Id as id, Content as content, IsRead as isRead, CreatedAt as createdAt
        FROM Notifications
        WHERE UserId = @userId
        ORDER BY CreatedAt DESC
      `);
      res.json({ notifications: result.recordset });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.post("/api/notifications/read", authenticateToken, async (req, res) => {
    try {
      if (!pool) return res.json({ success: true });

      const request = pool.request();
      request.input('userId', sql.Int, req.user!.id);
      
      await request.query(`
        UPDATE Notifications SET IsRead = 1 WHERE UserId = @userId AND IsRead = 0
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
