import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { generalRateLimit } from './middlewares/rateLimit.middleware.js';

const app: Application = express();

// Trust proxy (for Nginx reverse proxy)
app.set('trust proxy', 1);

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// Rate limiting
app.use(generalRateLimit);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
