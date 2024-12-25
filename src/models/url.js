import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  longUrl: { type: String, required: true },
  shortUrl: { type: String, required: true },
  alias: { type: String, required: true, unique: true },
  topic: { type: String },
  totalClicks: { type: Number, default: 0 },
  uniqueClicks: { type: Number, default: 0 },
  clicksByDate: [
    { 
      date: { type: Date, required: true }, 
      clicks: { type: Number, default: 0 } 
    }
  ],
  osType: [
    {
      osName: { type: String, required: true },
      uniqueClicks: { type: Number, default: 0 },
      uniqueUsers: { type: Number, default: 0 },
    }
  ],
  deviceType: [
    {
      deviceName: { type: String, required: true },
      uniqueClicks: { type: Number, default: 0 },
      uniqueUsers: { type: Number, default: 0 },
    }
  ],
}, { timestamps: true });

export default mongoose.model('URL', urlSchema);
