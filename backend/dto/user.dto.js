const userDTO = (user) => {
  return {
    id: user._id,
    name: user.name,
    userName: user.userName,
    role: user.role,
    stages: user.stages,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
  };
};

module.exports = userDTO;
