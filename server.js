const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // Import cors
const authRoutes = require('./routes/authRoutes'); 
const logentryRoutes = require('./routes/logentryRoutes'); 
const categoryRoutes = require('./routes/categoryRoutes');

dotenv.config(); // Load environment variables from .env file

const app = express();

// Enable CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Allow both ports
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));


// Middleware to parse JSON body data
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));

// Use API routes
app.use('/api/auth', authRoutes);
app.use('/api/logentry', logentryRoutes);
app.use('/api/category', categoryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
