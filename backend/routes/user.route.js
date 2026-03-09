const express = require("express");
const { createUser,} = require("../controllers/user.controller");
const validate = require("../middlewares/validate.middleware");
const { createUserSchema } = require("../validators/user.validator");
const router = express.Router();

router.post("/create-user", validate(createUserSchema), createUser);

module.exports = router;