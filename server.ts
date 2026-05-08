import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import { query, initDb } from './src/server/db.js';

const __dirname = path.resolve();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const upload = multer({ dest: 'uploads/' });

async function startServer() {
  await initDb();
  
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // --- Auth Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- API Routes ---

  app.post('/api/auth/register', async (req, res) => {
    const { firstName, lastName, username, password } = req.body;
    try {
      const existing = await query('SELECT * FROM users WHERE username = $1', [username]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await query(
        'INSERT INTO users (first_name, last_name, username, password_hash) VALUES ($1, $2, $3, $4) RETURNING id',
        [firstName, lastName, username, hashedPassword]
      );
      
      let userId;
      if (result && result.length > 0 && result[0].id) {
        userId = result[0].id;
      } else if (result && result.length > 0 && result[0].insertId) {
        userId = result[0].insertId; // SQLite fallback
      }

      const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: userId, firstName, lastName, username } });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const users = await query('SELECT * FROM users WHERE username = $1', [username]);
      if (users.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

      const user = users[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: user.id, username }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user.id, firstName: user.first_name, lastName: user.last_name, username: user.username, avatarUrl: user.avatar_url } });
    } catch (err) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.get('/api/users/me', authenticateToken, async (req: any, res) => {
    try {
      const users = await query('SELECT id, first_name, last_name, username, avatar_url FROM users WHERE id = $1', [req.user.id]);
      if (users.length === 0) return res.sendStatus(404);
      res.json(users[0]);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/users', authenticateToken, async (req: any, res) => {
    // get all users to follow (excluding self)
    try {
      const users = await query('SELECT id, first_name as "firstName", last_name as "lastName", username, avatar_url as "avatarUrl" FROM users WHERE id != $1', [req.user.id]);
      const following = await query('SELECT following_id FROM follows WHERE follower_id = $1', [req.user.id]);
      const followingSet = new Set(following.map((f: any) => f.following_id));
      
      const enrichedUsers = users.map(u => ({ ...u, isFollowing: followingSet.has(u.id) }));
      res.json(enrichedUsers);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/users/:id/follow', authenticateToken, async (req: any, res) => {
    try {
      await query('INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)', [req.user.id, req.params.id]);
      res.json({ success: true });
    } catch (err) {
      // Might already exist
      res.status(400).json({ error: 'Could not follow' });
    }
  });

  app.delete('/api/users/:id/follow', authenticateToken, async (req: any, res) => {
    try {
      await query('DELETE FROM follows WHERE follower_id = $1 AND following_id = $2', [req.user.id, req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: 'Could not unfollow' });
    }
  });

  app.get('/api/posts', authenticateToken, async (req: any, res) => {
    try {
      // Get posts from followed users + self
      const posts = await query(`
        SELECT p.id, p.content, p.image_url, p.created_at, 
               u.id as user_id, u.first_name, u.last_name, u.username, u.avatar_url
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.user_id IN (
          SELECT following_id FROM follows WHERE follower_id = $1
        ) OR p.user_id = $1
        ORDER BY p.created_at DESC
      `, [req.user.id]);
      
      res.json(posts.map((p: any) => ({
        id: p.id,
        content: p.content,
        imageUrl: p.image_url,
        createdAt: p.created_at,
        user: { id: p.user_id, firstName: p.first_name, lastName: p.last_name, username: p.username, avatarUrl: p.avatar_url }
      })));
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/posts', authenticateToken, upload.single('image'), async (req: any, res) => {
    try {
      const { content } = req.body;
      let imageUrl = null;
      if (req.file) {
        imageUrl = '/uploads/' + req.file.filename;
      }
      
      await query('INSERT INTO posts (user_id, content, image_url) VALUES ($1, $2, $3)', [req.user.id, content, imageUrl]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create post' });
    }
  });

  app.get('/api/activities', authenticateToken, async (req: any, res) => {
    try {
      // Simplified: return all activities (in a real app, maybe filter by follow or public)
      const activities = await query(`
        SELECT a.id, a.title, a.category, a.start_time, a.end_time,
               u.id as user_id, u.first_name, u.last_name, u.username
        FROM activities a
        JOIN users u ON a.user_id = u.id
        ORDER BY a.start_time ASC
      `);
      res.json(activities.map((a: any) => ({
        id: a.id,
        title: a.title,
        category: a.category,
        startTime: a.start_time,
        endTime: a.end_time,
        user: { id: a.user_id, firstName: a.first_name, lastName: a.last_name, username: a.username }
      })));
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/activities', authenticateToken, async (req: any, res) => {
    const { title, category, startTime, endTime } = req.body;
    try {
      await query(
        'INSERT INTO activities (user_id, title, category, start_time, end_time) VALUES ($1, $2, $3, $4, $5)',
        [req.user.id, title, category, startTime, endTime]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create activity' });
    }
  });

  app.get('/api/messages/:userId', authenticateToken, async (req: any, res) => {
    const { userId } = req.params;
    try {
      const messages = await query(`
        SELECT * FROM messages 
        WHERE (sender_id = $1 AND receiver_id = $2) 
           OR (sender_id = $2 AND receiver_id = $1)
        ORDER BY created_at ASC
      `, [req.user.id, userId]);
      res.json(messages.map((m: any) => ({
        id: m.id,
        senderId: m.sender_id,
        receiverId: m.receiver_id,
        content: m.content,
        createdAt: m.created_at
      })));
    } catch(err) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  app.post('/api/messages', authenticateToken, async (req: any, res) => {
    const { receiverId, content } = req.body;
    try {
      await query('INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3)', [req.user.id, receiverId, content]);
      res.json({ success: true });
    } catch(err) {
      res.status(500).json({ error: 'Failed' });
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
