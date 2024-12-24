import mongoose from 'mongoose';

const AnalyticsSchema = new mongoose.Schema({
  alias: String,
  ip: String,
  timestamp: Date,
  userAgent: String,
  osType: String,
  deviceType: String,
  topic: String, // New field for topic-based analytics
});

export default mongoose.model('Analytics', AnalyticsSchema);

