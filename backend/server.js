const dns = require('dns');
// Set DNS servers to Google and Cloudflare to resolve querySrv issues with MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  console.warn('Warning: Could not set custom DNS servers:', err.message);
}

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

/* Load environment variables */
dotenv.config();

/* Connect to MongoDB */
connectDB();

const app = express();

/* Trust the reverse proxy (Render) so rate limiting works correctly */
app.set('trust proxy', 1);

/* Security middleware */
app.use(helmet());

/* CORS — allow frontend with credentials */
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

/* Body parsers */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Cookie parser */
app.use(cookieParser());

/* API Routes */
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/donor', require('./routes/donorRoutes'));
app.use('/api/patient', require('./routes/patientRoutes'));
app.use('/api/hospital', require('./routes/hospitalRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

/* Health check */
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'BDMS API is running' });
});

/* Error handling middleware */
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

/* Start server */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
