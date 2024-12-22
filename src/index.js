import express from 'express';
import dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import redisClient from './config/redis.js';
import authRoutes from './routes/authRoutes.js';
import urlRoutes from './routes/urlRoute.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { errorHandler } from './middlewares/errorHandler.Middleware.js';
import swaggerUi from 'swagger-ui-express';
import connectDB from './config/db.js';
import fs from 'fs'; // Use fs module to read JSON file

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Log the raw content of swagger.json
const swaggerFileContent = fs.readFileSync('./src/docs/swagger.json', 'utf8');
// console.log('Swagger JSON file content:', swaggerFileContent);

// Read and parse the Swagger JSON file
let swaggerDocument;
try {
  swaggerDocument = JSON.parse(swaggerFileContent);
} catch (error) {
  console.error('Error parsing JSON:', error.message);
  process.exit(1); // Exit the app if JSON parsing fails
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
connectDB();
// redisClient.on('connect', () => console.log('Connected to Redis'));

// Session Management
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  })
);

// Passport Authentication
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api/shorten', urlRoutes);
app.use('/api/analytics', analyticsRoutes);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error Handling Middleware
app.use(errorHandler);

// Server Start
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
