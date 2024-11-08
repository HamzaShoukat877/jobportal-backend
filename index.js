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

const app = express();


// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors());


const PORT = process.env.PORT || 8080;

// api
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/company', companyRoutes);
app.use('/api/v1/job', jobRoutes);

app.use('/api/v1/application', applicationRoutes);

app.get('/', (req, res) => {
  res.send("server is running");
});

app.get('/api/v1/test', (req, res) => {
  res.send("test");
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});

