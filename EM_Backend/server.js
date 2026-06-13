import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./src/routes/Routes.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();

// Enable CORS, allow origin via FRONTEND_URL or default to all origins
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

// Serve uploaded files (profile pictures) from the uploads directory
// app.use(
//   "/uploads",
//   express.static(path.join(process.cwd(), "uploads"))
// );

console.log("MONGO_URL:", process.env.MONGO_URL);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB Connected");
  })               
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.send("API Running");
});


app.use("/api", userRoutes);

// Swagger UI
try {
  const docPath = path.join(process.cwd(), "src", "docs", "openapi.json");
  if (fs.existsSync(docPath)) {
    const raw = fs.readFileSync(docPath);
    const openapiDocument = JSON.parse(raw);
    app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));
    console.log("Swagger UI available at /api-docs");
  }
} catch (err) {
  console.error("Failed to load OpenAPI document for Swagger:", err);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
