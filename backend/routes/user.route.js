const express = require("express");
const {
  createUser,
  loginUser,
  getUserProfile,
} = require("../controllers/user.controller");
const validate = require("../middlewares/validate.middleware");
const {
  createUserSchema,
  signInSchema,
} = require("../validators/user.validator");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/create-user", validate(createUserSchema), createUser);
router.post("/login-user", validate(signInSchema), loginUser);
router.get("/user-profile", authMiddleware, getUserProfile);

module.exports = router;
