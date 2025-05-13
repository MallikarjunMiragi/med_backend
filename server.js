const express = require('express');
const multer = require("multer");
const path = require("path");

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // Import cors
const authRoutes = require('./routes/authRoutes'); 
const logentryRoutes = require('./routes/logentryRoutes'); 
const categoryRoutes = require('./routes/categoryRoutes');
const uploadRoute = require('./routes/uploadRoute'); 
const supportRoutes = require('./routes/supportRoutes');
dotenv.config(); // Load environment variables from .env file

const app = express();
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage: storage });

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));


// Enable CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Allow both ports
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));


// Middleware to parse JSON body data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));

// Use API routes
app.use('/api/auth', authRoutes);

// Use the upload route
app.use('/api', uploadRoute);

// Optional: a simple test route
app.get('/', (req, res) => {
  res.send('API is working!');
});

app.use('/api/logentry', logentryRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api', supportRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
