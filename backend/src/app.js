
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import 'dotenv/config'
import session from 'express-session'
import mongoSanitize from 'express-mongo-sanitize'
import rateLimit from 'express-rate-limit'
import passport from './config/passport.js'
import authRoutes from './routes/auth.routes.js'
import adminRoutes from './routes/admin.routes.js'
import projectRoutes from './routes/project.routes.js'
import likeRoutes from './routes/like.routes.js'
import followRoutes from './routes/follow.routes.js'
import notificationRoutes from "./routes/notification.routes.js";
import userRoutes from './routes/user.routes.js';
import "./events/listners.js"; // register all event listeners


const app = express()

// ── A05: Security Headers ────────────────────────────────────
app.use(helmet())

// ── A09: Security Logging ────────────────────────────────────
app.use(morgan('dev'))

// ── A05: Strict CORS ─────────────────────────────────────────
const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : []
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., server-to-server, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

// ── A03: NoSQL Injection Protection ──────────────────────────
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use(mongoSanitize())

// ── A02: Secure Session Cookies ──────────────────────────────
const isProduction = process.env.NODE_ENV === 'production'
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}))
app.use(passport.initialize())
app.use(passport.session())

// ── A07: Rate Limiting (Auth endpoints) ──────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 50,                    // limit each IP to 50 auth requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
})

// ── A07: Rate Limiting (Global API) ──────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
})

app.use('/api/', apiLimiter)
app.use('/api/auth', authLimiter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/likes', likeRoutes)
app.use('/api/follows', followRoutes)
app.use("/api/notifications", notificationRoutes);
app.use('/api/users', userRoutes);



// ── A05: Safe Error Handler (no stack traces in production) ──
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR: ${err.message}`);

  // Only log stack traces in development
  if (!isProduction) {
    console.error(err.stack);
  }

  const status = err.status || 500;

  res.status(status).json({
    success: false,
    message: isProduction ? 'Internal Server Error' : err.message,
  });
});

export default app;
