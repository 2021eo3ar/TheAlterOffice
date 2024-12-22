import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  alias: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  userAgent: { type: String },
  ip: { type: String },
  geolocation: { type: Object },
});

export default mongoose.model('Analytics', analyticsSchema);
