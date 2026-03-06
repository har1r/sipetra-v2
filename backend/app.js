const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

// MIDDLEWARES GLOBAL
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Reporting System API" });
});

// ERROR HANDLER (Middlewares)
app.use((req, res, next) => {
  const error = new Error("Resource Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    error: {
      message: error.message || "Inernal Server Error",
    },
  });
});

module.exports = app;
