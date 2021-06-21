import { verifyToken } from "../../utils/auth";
import connectDB from "../../utils/connect_db";

const handler = async (req, res) => {
  try {
    const user = await verifyToken(req);

    if (user) {
      return res.status(200).json({
        _id: user.id,
        id: user.id,
        email: user.email,
        roles: user.roles,
      });
    } else {
      return res.status(404).send("User not found");
    }
  } catch (error) {
    console.log(error);
    return res.status(403).send("Invalid token");
  }
};

export default connectDB(handler);
