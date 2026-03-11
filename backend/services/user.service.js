const userRepository = require("../repositories/user.repository");
const { hashPassword, comparePassword } = require("../utils/password.util");
const { generateToken } = require("../utils/jwt.util");

const ALL_STAGES = [
  "penginputan",
  "penelitian",
  "pengarsipan",
  "pengiriman",
  "pemeriksaan",
];

const registerUser = async (userData) => {
  const { adminSecret, ...safeData } = userData;

  const existingUser = await userRepository.findDuplicate(
    safeData.email,
    safeData.userName,
  );

  if (existingUser) {
    throw new Error(
      existingUser.email === safeData.email
        ? "Email sudah ada"
        : "Username sudah ada",
    );
  }

  if (safeData.role === "admin") {
    if (adminSecret !== process.env.ADMIN_SECRET) {
      throw new Error("Unauthorized: Admin Secret Salah.");
    }

    safeData.stages = ALL_STAGES;
  }

  if (
    safeData.role === "operator" &&
    (!safeData.stages || safeData.stages.length === 0)
  ) {
    throw new Error("Operator wajib memiliki minimal satu stage.");
  }

  const hashedPassword = await hashPassword(safeData.password);

  const user = await userRepository.create({
    ...safeData,
    password: hashedPassword,
  });

  const payload = {
    id: user._id,
    role: user.role,
    stages: user.stages,
  };
  const token = generateToken(payload);

  return { user, token };
};

const signInUser = async (userData) => {
  const { password, email, userName } = userData;

  const existingUser = await userRepository.findDuplicate(email, userName);

  const isPasswordValid =
    existingUser && (await comparePassword(password, existingUser.password));
  if (!isPasswordValid) {
    throw new Error("Email atau Password salah");
  }

  const payload = {
    id: existingUser._id,
    role: existingUser.role,
    stages: existingUser.stages,
  };
  const token = generateToken(payload);

  const modifiedUser = {
    ...existingUser,
    lastLogin: new Date(),
  };

  return { modifiedUser, token };
};

const findUserProfile = async (userId) => {
  const existingUser = await userRepository.findOneUser(userId);

  if (!existingUser) throw new Error("User tidak ditemukan");

  const modifiedUser = {
    ...existingUser,
    lastLogin: new Date(),
  };

  return modifiedUser;
};

module.exports = { registerUser, signInUser, findUserProfile };
