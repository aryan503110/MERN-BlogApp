import express from "express";
const app = express();
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import UserModel from "./models/UserModel.js";
import PostModel from "./models/PostModel.js";

dotenv.config();
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/Blog");

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json("The token is missing");
  } else {
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) {
        return res.json("The token is wrong");
      } else {
        req.email = decoded.email;
        req.username = decoded.username;
        next();
      }
    });
  }
};

app.get("/", verifyUser, (req, res) => {
  return res.json({ email: req.email, username: req.username });
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (user) {
      return res.json({ message: "User Already Exist", success: false });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({
      name,
      email,
      password: hashPassword,
    });
    await newUser.save();
    return res.json({ message: "User Created", success: true });
  } catch (error) {
    return res.json(error);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res.json({ message: "Wrong Email or Password", success: false });
    }
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.json({ message: "Wrong Email or Password", success: false });
    }

    const token = jwt.sign(
      { email: user.email, username: user.username },
      process.env.JWT_KEY,
      { expiresIn: "1d" }
    );
    res.cookie("token", token);
    return res.json({
      login: true,
      message: "Successfully Logged In",
      success: true,
    });
  } catch (error) {
    return res.json(error);
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Public/Images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
});

app.post("/create", verifyUser, upload.single("file"), (req, res) => {
  PostModel.create({
    title: req.body.title,
    description: req.body.description,
    file: req.file.filename,
    email: req.body.email,
  })
    .then((result) => res.json("Success"))
    .catch((err) => res.json(err));
});

app.get("/getposts", (req, res) => {
  PostModel.find()
    .then((posts) => res.json(posts))
    .catch((err) => res.json(err));
});

app.get("/getpostbyid/:id", (req, res) => {
  const id = req.params.id;
  PostModel.findById({ _id: id })
    .then((post) => res.json(post))
    .catch((err) => console.log(err));
});

app.put("/editpost/:id", (req, res) => {
  const id = req.params.id;
  PostModel.findByIdAndUpdate(
    { _id: id },
    {
      title: req.body.title,
      description: req.body.description,
    }
  )
    .then((result) => res.json("Success"))
    .catch((err) => res.json(err));
});

app.delete("/deletepost/:id", (req, res) => {
  PostModel.findByIdAndDelete({ _id: req.params.id })
    .then((result) => res.json("Success"))
    .catch((err) => res.json(err));
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json("success");
});

app.listen(process.env.PORT || 5500, () => {
  console.log(`Server running on ${process.env.PORT}`);
});
