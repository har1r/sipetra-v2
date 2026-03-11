const {
  registerUser,
  signInUser,
  findUserProfile,
} = require("../services/user.service");
const userDTO = require("../dto/user.dto");

const createUser = async (req, res, next) => {
  try {
    const { user, token } = await registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "User berhasil dibuat",
      token,
      data: userDTO(user),
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { modifiedUser, token } = await signInUser(req.body);

    res.status(200).json({
      success: true,
      message: "login berhasil",
      token,
      data: userDTO(modifiedUser),
    });
  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const modifiedUser = await findUserProfile(userId);

    res.status(200).json({
      success: true,
      message: "Berhasil mendapatkan data user",
      data: userDTO(modifiedUser),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  loginUser,
  getUserProfile,
};
