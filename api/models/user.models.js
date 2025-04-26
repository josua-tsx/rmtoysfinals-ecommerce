import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserModelSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    firstName: {
      type: String
    },

    lastName: {
      type: String,
    },

    fullName: {
      type: String,
    },

    username: {
      type: String,
      required: [true, "Username is required"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      // minLength: [6, "Password must be at least 6 characters long"],
    },

    avatar: {
      type: String,
      default:
        "https://medschool.uci.edu/sites/default/files/styles/staff_faculty_photo/public/media-images/noun-person-4046839-cropped-uci-site-colors_0.jpg?h=167045e9&itok=5PT_EoCP",
    },

    phoneNumber: {
      type: String,
    },

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },

    address: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
      },
    ],

    role: {
      type: String,
      enum: ["customer", "admin", "validatorStaff"],
      default: "customer",
    },

    jobDescription: {
      type: String,
    },

    credits: {
      type: Number,
      default: 0,
    },

    creditLock: {
      type: Date,
      default: null
    },

    isLoggedIn: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash the password before saving to the database
UserModelSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// UserModelSchema(.method) is a custom instance "method" object allows
//you to define functions that you want to be accessible on each document instance.
// basically you can name anything you want after the method based on what that
// functions will do. in this case it will compare the hashed password in the login/signup
UserModelSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", UserModelSchema);

export default User;
