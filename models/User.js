import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    roles: {
      type: Array,
      required: false,
      default: ["user"],
    },
    password: {
      type: String,
      required: true,
    },
    lastLoggedIn: {
      type: Number,
      required: false,
    },
    retryPasswordCount: {
      type: Number,
      default: 0,
      required: false,
    },
    lastRetryPassword: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
