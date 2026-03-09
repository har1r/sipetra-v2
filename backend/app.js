const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const userRoutes = require("./routes/user.route");
const errorHandler = require("./middlewares/error.middleware")
const app = express();

// MIDDLEWARES GLOBAL
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use("/api/users", userRoutes);
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Reporting System API" });
});

// ERROR HANDLER (Middlewares)
app.use((req, res, next) => {
  const error = new Error("Resource Not Found");
  error.status = 404;
  next(error);
});

app.use(errorHandler);

module.exports = app;
