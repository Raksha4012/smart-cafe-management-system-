import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

const router = express.Router();

// Download CSV file by type
router.get('/csv/:type', (req, res) => {
  const { type } = req.params;
  const allowed = ['users', 'orders', 'menu', 'ratings', 'kitchen'];

  if (!allowed.includes(type)) {
    return res.status(400).json({ error: `Invalid CSV type. Allowed: ${allowed.join(', ')}` });
  }

  const filePath = path.join(DATA_DIR, `${type}.csv`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: `CSV file for ${type} not found.` });
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${type}.csv"`);
  return res.sendFile(filePath);
});

export default router;
