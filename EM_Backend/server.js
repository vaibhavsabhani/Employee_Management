import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./src/routes/Routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/test-env", (req, res) => {
  res.json({
    mongoExists: !!process.env.MONGO_URL,
    mongoUriLength: process.env.MONGO_URL?.length || 0,
    JWT_SECRET : process.env.JWT_SECRET,
    PORT:process.env.PORT
  });
});

app.get("/api/test-mongo", async (req, res) => {
  try {
    const state = mongoose.connection.readyState;

    return res.json({
      readyState: state,
      mongoUriExists: !!process.env.MONGO_URL,
    });
  } catch (err) {
    return res.json(err);
  }
});