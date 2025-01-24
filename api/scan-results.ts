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

    if (req.method === 'POST') {
      const scanResult = new ScanResult(req.body);
      await scanResult.save();
      return res.status(201).json(scanResult);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in scan-results api:', error);
    res.status(500).json({ error: 'Failed to save scan result' });
  }
}