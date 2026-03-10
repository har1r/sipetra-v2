const express = require("express");
const { createUser, loginUser } = require("../controllers/user.controller");
const validate = require("../middlewares/validate.middleware");
const {
  createUserSchema,
  signInSchema,
} = require("../validators/user.validator");

const router = express.Router();

router.post("/create-user", validate(createUserSchema), createUser);
router.post("/login-user", validate(signInSchema), loginUser);

module.exports = router;
