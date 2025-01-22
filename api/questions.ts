import { VercelRequest, VercelResponse } from '@vercel/node';
import { questions } from '../backend/data/questions';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json(questions);
}