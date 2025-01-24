import { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';

// MongoDB Connection
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  
  await mongoose.connect(process.env.MONGODB_URI || 'No DB');
};

// Define Schema
const scanResultSchema = new mongoose.Schema({
  name: String,
  verdict: String,
  message: String,
  score: Number,
  country: String,
  timestamp: { type: Date, default: Date.now },
});

// Initialize model
const ScanResult = mongoose.models.ScanResult || mongoose.model('ScanResult', scanResultSchema);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDB();

    const leaderboard = await ScanResult.find()
      .sort({ score: -1 })
      .limit(100)
      .exec();
      
    res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error in leaderboard api:', error);
    res.status(500).json({ error: 'Failed to retrieve leaderboard' });
  }
}