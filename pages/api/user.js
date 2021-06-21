import connectDB from "../../utils/connect_db";
import User from "../../models/User";
import { verifyToken } from "../../utils/auth";
import bcrypt from "bcrypt";
import isEmail from "validator/lib/isEmail";
import isLength from "validator/lib/isLength";
import SHA256 from "sha256";

const handler = async (req, res) => {
  switch (req.method) {
    case "GET":
      await handleGetRequest(req, res);
      break;
    case "POST":
      await handlePostRequest(req, res);
      break;
    default:
      res.status(405).send(`Method ${req.method} not allowed`);
      break;
  }
};

async function handleGetRequest(req, res) {
  try {
    await verifyToken(req);
    const users = await User.find({}).sort({
      createdAt: "desc",
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(403).send("Please login again");
  }
}

async function handlePostRequest(req, res) {
  await verifyToken(req);

  const { password } = req.body;
  const email = req.body.email.toLowerCase();

  try {
    // 1) Validate name / email / password
    if (!isLength(password, { min: 6 })) {
      return res
        .status(422)
        .send("The password must be at least 6 characters.");
    } else if (!isEmail(email)) {
      return res.status(422).send("Email must be valid.");
    }

    // 2) Check to see if the user already exists in the db
    const user = await User.findOne({ email: email });

    if (user) {
      return res.status(422).send(`User already exists with email ${email}`);
    }

    // 3) If not, hash their password
    let passwordSHA = SHA256(password);
    const hash = await bcrypt.hash(passwordSHA, 10);

    // 4) create user
    const newUser = await new User({
      email,
      password: hash,
    }).save();

    newUser.save();

    // 5) send back success
    return res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error signing up user. Please try again later");
  }
}

export default connectDB(handler);
