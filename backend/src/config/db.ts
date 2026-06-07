import dotenv from 'dotenv';
import { localDb } from './localDb';

dotenv.config();

export let isMongoConnected = false;

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log("--------------------------------------------------");
    console.log("⚠️  MONGODB_URI not provided in .env");
    console.log("💾 CareerPilot AI is running using local_db.json fallback.");
    console.log("--------------------------------------------------");
    return;
  }

  try {
    // Attempt dynamic import of mongoose so it doesn't fail if dependencies are not loaded
    const mongoose = require('mongoose');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    isMongoConnected = true;
    console.log("--------------------------------------------------");
    console.log("🔌 Connected to MongoDB successfully!");
    console.log("--------------------------------------------------");
  } catch (error: any) {
    console.log("--------------------------------------------------");
    console.log("❌ Failed to connect to MongoDB:", error.message);
    console.log("💾 Falling back to local_db.json file database.");
    console.log("--------------------------------------------------");
  }
}
