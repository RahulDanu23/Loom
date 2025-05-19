import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  userType: { type: String, enum: ['student', 'faculty'], default: 'student' },
  semester: { type: String },
  department: { type: String },
  section: { type: String },
  universityRoll: { type: String },
  classRoll: { type: String },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Index for email lookup efficiency
userSchema.index({ email: 1 });

// Method to check if password reset token is still valid
userSchema.methods.isResetTokenValid = function () {
  return this.resetPasswordExpires && this.resetPasswordExpires > Date.now();
};
const userModel = mongoose.model("User", userSchema);
export default userModel;