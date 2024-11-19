import express from "express";
import "dotenv/config";
import morgan from "morgan";
import cors from "cors";
import usersRouter from "./routes/users.js";
import connect from "./db/connect.js";
connect();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// Routers
app.use("/api/users", usersRouter);

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