const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const healhtRoutes = require("./routes/health.route");
const userRoutes = require("./routes/user.route");
const errorHandler = require("./middlewares/error.middleware");
const app = express();

// MIDDLEWARES GLOBAL
app.use(helmet());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use("/api", healhtRoutes);
app.use("/api/users", userRoutes);

// ERROR HANDLER (Middlewares)
app.use((req, res, next) => {
  const err = new Error("Resource Not Found");
  err.status = 404;
  next(err);
});

app.use(errorHandler);

module.exports = app;
