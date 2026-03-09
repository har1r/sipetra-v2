const User = require("../models/User");

class UserRepository {
  async create(userData) {
    return User.create(userData);
  }

  async findDuplicate(email, userName) {
    return User.findOne({
      $or: [{ email: email.toLowerCase() }, { userName: userName }],
    }).select("email userName");
  }
}

module.exports = new UserRepository();