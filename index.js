import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utlils/db.js";
import userRoutes from "./routes/user.routes.js";
import companyRoutes from "./routes/company.routes.js";
import jobRoutes from "./routes/job.routes.js";
import applicationRoutes from "./routes/applicaton.routes.js";
dotenv.config({ path: "./.env" });


// Load environment variables
dotenv.config({ path: './.env' });

// Validate required environment variables
if (!process.env.SECRET_KEY) {
  throw new Error('SECRET_KEY is not set in .env file');
}

const app = express();

// Middleware
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const allowedOrigins = ['http://localhost:5173', 'https://octopus-app-crtmn.ondigitalocean.app'];
app.use(cors({
  origin(origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Allows cookies to be sent
}));

// Routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/job', jobRoutes);
app.use('/api/v1/application', applicationRoutes);

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.get('/api/v1/test', (req, res) => {
  res.send('Test');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: err.message });
});

// Connect to the database and start server
const PORT = process.env.PORT || 8080;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to the database', err);
    process.exit(1);
  });

