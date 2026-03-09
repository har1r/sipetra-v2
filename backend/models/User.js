const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    userName: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["admin", "operator", "viewer"],
      required: true,
    },
    stages: {
      type: [
        {
          type: String,
          enum: [
            "penginputan",
            "penelitian",
            "pengarsipan",
            "pengiriman",
            "pemeriksaan",
          ],
        },
      ],
      default: [],
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true },
);

userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

userSchema.pre("save", function () {
  if (this.role === "admin" && (this.isModified("role") || this.isNew)) {
    this.stages = [
      "penginputan",
      "penelitian",
      "pengarsipan",
      "pengiriman",
      "pemeriksaan",
    ];
  }
});

module.exports = mongoose.model("User", userSchema);
