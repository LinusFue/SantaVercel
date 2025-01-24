import { Question } from './types';
import { questions } from './data/questions';
import express, { Express, Request, Response } from "express";
import cors from "cors";
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

const app: Express = express();
const port = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple CORS setup - allow all in development, same-origin in production
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || '')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error: any) => console.error('MongoDB connection error:', error));

// Define Schema
const scanResultSchema = new mongoose.Schema({
  name: String,
  verdict: String,
  message: String,
  score: Number,
  country: String,
  timestamp: { type: Date, default: Date.now },
});

const ScanResult = mongoose.model('ScanResult', scanResultSchema);

// API Routes
app.get("/api/questions", (req: Request, res: Response) => {
  res.json(questions);
});

app.post("/api/scan-results", async (req: Request, res: Response) => {
  try {
    const scanResult = new ScanResult(req.body);
    await scanResult.save();
    res.status(201).json(scanResult);
  } catch (error) {
    console.error('Error saving scan result:', error);
    res.status(500).json({ error: 'Failed to save scan result' });
  }
});

app.get("/api/leaderboard", async (req: Request, res: Response) => {
  try {
    const leaderboard = await ScanResult.find()
      .sort({ score: -1 })
      .limit(100)
      .exec();
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to retrieve leaderboard' });
  }
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' });
});

// Serve static files in production
if (NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, 'public');
  console.log('Static files directory:', publicPath);
  
  // Check if the directory exists
  if (fs.existsSync(publicPath)) {
    console.log('Public directory exists');
    const files = fs.readdirSync(publicPath);
    console.log('Files in public directory:', files);
  } else {
    console.log('Public directory does not exist');
  }

  // Serve static files
  app.use(express.static(publicPath));

  // All other routes should serve index.html
  app.get('*', (req: Request, res: Response) => {
    const indexPath = path.join(publicPath, 'index.html');
    console.log('Attempting to serve index.html from:', indexPath);
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      console.error('index.html not found at:', indexPath);
      res.status(404).send('Frontend files not found');
    }
  });
}

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  console.log(`[server]: Environment is ${NODE_ENV}`);
});