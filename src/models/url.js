import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  longUrl: { type: String, required: true },
  shortUrl: { type: String, required: true },
  alias: { type: String, required: true, unique: true },
  topic: { type: String },
});

export default mongoose.model('URL', urlSchema);
