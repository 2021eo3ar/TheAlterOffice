import express from 'express';
import dotenv from "dotenv"
import connectDB from './config/db.js';
import redisClient from './config/redis.js';
import urlRoutes from './routes/urlRoute.js';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api', urlRoutes);
app.use("/" , (req, res) => {
   console.log("server is running");
})

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start Server
const PORT = process.env.PORT || 5000;
connectDB();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
