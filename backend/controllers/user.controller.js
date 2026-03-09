const { registerUser } = require("../services/user.service");
const userDTO = require("../dto/user.dto");

const createUser = async (req, res, next) => {
  try {
    const { user, token } = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "User berhasil dibuat",
      token,
      data: userDTO(user)
    });

  } catch (error) {
    next(error);
  }

};

module.exports = {
  createUser
};