import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import kitchenRoutes from './routes/kitchenRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import exportRoutes from './routes/exportRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/export', exportRoutes);

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Cafe Management API Server</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #1e293b; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
          .card { background: white; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); max-width: 520px; width: 100%; }
          h1 { color: #2563eb; font-size: 1.5rem; margin-top: 0; }
          .badge { background: #dcfce7; color: #166534; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; }
          .btn { display: inline-block; background: #2563eb; color: white; padding: 0.75rem 1.25rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; margin-top: 1rem; }
          .btn-csv { display: inline-block; background: #059669; color: white; padding: 0.35rem 0.75rem; border-radius: 0.375rem; text-decoration: none; font-size: 0.8rem; font-weight: 600; margin: 0.2rem; }
          ul { padding-left: 1.25rem; color: #475569; }
          li { margin-bottom: 0.5rem; }
        </style>
      </head>
      <body>
        <div class="card">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h1>☕ Cafe REST API Server</h1>
            <span class="badge">Running</span>
          </div>
          <p>Backend REST API server running on <code>http://localhost:5000</code>.</p>
          <a href="http://localhost:3000" class="btn" target="_blank">Open Frontend UI (http://localhost:3000)</a>
          
          <h3 style="margin-top: 1.5rem;">📥 Download CSV Data Files:</h3>
          <div>
            <a href="/api/export/csv/users" class="btn-csv" download>📄 Users.csv</a>
            <a href="/api/export/csv/orders" class="btn-csv" download>📄 Orders.csv</a>
            <a href="/api/export/csv/menu" class="btn-csv" download>📄 Menu.csv</a>
            <a href="/api/export/csv/ratings" class="btn-csv" download>📄 Ratings.csv</a>
            <a href="/api/export/csv/kitchen" class="btn-csv" download>📄 Kitchen.csv</a>
          </div>

          <h3 style="margin-top: 1.5rem;">Available API Endpoints:</h3>
          <ul>
            <li><code>GET <a href="/api/health">/api/health</a></code></li>
            <li><code>GET <a href="/api/menu">/api/menu</a></code></li>
            <li><code>GET <a href="/api/orders">/api/orders</a></code></li>
            <li><code>GET <a href="/api/kitchen">/api/kitchen</a></code></li>
            <li><code>GET <a href="/api/analytics">/api/analytics</a></code></li>
            <li><code>GET <a href="/api/users">/api/users</a></code></li>
            <li><code>GET <a href="/api/ratings">/api/ratings</a></code></li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Cafe Management System Backend running on http://localhost:${PORT}`);
});
