import connectDB from "../../utils/connect_db";
import User from "../../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import SHA256 from "sha256";
import {
  TOKEN_EXPIRE_IN,
  RETRY_TIMEOUT_MIN,
  JWT_SECRET,
} from "../../utils/constant";

const handler = async (req, res) => {
  const { password } = req.body;
  const email = req.body.email.toLowerCase();

  try {
    const user = await User.findOne({ email }).select("password");

    if (user) {
      if (!user.lastRetryPassword) {
        user.lastRetryPassword = 0;
      }

      if (
        user.retryPasswordCount >= 3 &&
        Math.floor(Date.now() - user.lastRetryPassword) <
          RETRY_TIMEOUT_MIN * 60 * 1000
      ) {
        user.lastRetryPassword = Date.now();
        await user.save();

        return res
          .status(401)
          .send(
            "Maximum number of login attempts reached. Please try again in 30 minutes."
          );
      }

      const passwordSHA = SHA256(password);
      const passwordsMatch = await bcrypt.compare(passwordSHA, user.password);

      if (passwordsMatch) {
        const loggedInDate = Date.now();
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
          expiresIn: TOKEN_EXPIRE_IN,
        });

        user.lastLoggedIn = loggedInDate;
        user.lastRetryPassword = 0;
        user.retryPasswordCount = 0;

        await user.save();

        return res.status(200).json(token);
      } else {
        user.retryPasswordCount =
          (user.retryPasswordCount ? user.retryPasswordCount : 0) + 1;
        user.lastRetryPassword = Date.now();

        await user.save();

        return res.status(401).send("Invalid login attempt. Please try again.");
      }
    } else {
      return res.status(404).send("Invalid login attempt. Please try again.");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error logging in user.");
  }
};

export default connectDB(handler);
