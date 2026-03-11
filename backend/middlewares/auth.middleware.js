const { verifyToken } = require("../utils/jwt.util");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader);
  if (!authHeader) {
    return res.status(401).json({
      message: "Token tidak ditemukan",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token tidak valid",
    });
  }
};

module.exports = authMiddleware;
