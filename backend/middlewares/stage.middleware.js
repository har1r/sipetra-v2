const checkStagePermission = (stage) => {
  return (req, res, next) => {
    const { role, stages } = req.user;

    if (role === "admin") {
      return next();
    }

    if (!stages || !stages.includes(stage)) {

      return res.status(403).json({
        message: "Tidak memiliki akses ke stage ini"
      });
    }

    next();
  };
};

module.exports = checkStagePermission;