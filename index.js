import express from "express";
import "dotenv/config";
import morgan from "morgan";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import usersRouter from "./routes/users.js";
import loginsRouter from "./routes/logins.js";
import postsRouter from "./routes/posts.js";
import messagesRouter from "./routes/messages.js";
import connect from "./db/connect.js";

connect(); // Connect to MongoDB

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), 'uploads')));

// Routers
app.use("/api/users", usersRouter);
app.use("/api/logins", loginsRouter);
app.use("/api/posts", postsRouter);
app.use("/api/messages", messagesRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the Root API.");
})

// Default error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!...");
});

// Listen for PORT
app.listen(PORT, () => {  
  console.log(`Server running on port http://localhost:${PORT}`);
})