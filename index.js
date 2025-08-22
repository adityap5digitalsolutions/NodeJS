// Import dependencies
const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

// ----------------------
// Database Connection
// ----------------------
mongoose.connect("mongodb://localhost:27017/e-comm", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// ----------------------
// Schemas & Models
// ----------------------

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  brand: String,
  price: Number,
  category: String,
  stock: Number,
});

const Product = mongoose.model("products", productSchema);

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String, // hashed password
});

const User = mongoose.model("users", userSchema);

// ----------------------
// File Upload (Multer)
// ----------------------
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads");
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + "-" + Date.now() + ".jpg");
    },
  }),
}).single("file_name");

app.post("/upload", upload, (req, resp) => {
  resp.send("file uploaded successfully");
});

// ----------------------
// Product APIs
// ----------------------
app.post("/create", async (req, resp) => {
  let data = new Product(req.body);
  const result = await data.save();
  resp.send(result);
});

app.get("/list", async (req, resp) => {
  let data = await Product.find();
  resp.send(data);
});

app.delete("/delete/:_id", async (req, resp) => {
  let data = await Product.deleteOne(req.params);
  resp.send(data);
});

app.put("/update/:_id", async (req, resp) => {
  let data = await Product.updateOne(req.params, { $set: req.body });
  resp.send(data);
});

app.get("/search/:key", async (req, resp) => {
  let data = await Product.find({
    $or: [
      { name: { $regex: req.params.key, $options: "i" } },
      { brand: { $regex: req.params.key, $options: "i" } },
    ],
  });
  resp.send(data);
});

// ----------------------
// Auth APIs (Signup / Login)
// ----------------------

// Signup API
app.post("/signup", async (req, resp) => {
  try {
    const { username, email, password } = req.body;

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    resp.status(201).send({ message: "User registered successfully!" });
  } catch (err) {
    resp.status(400).send({ error: err.message });
  }
});

// Login API
app.post("/login", async (req, resp) => {
  try {
    const { email, password } = req.body;

    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return resp.status(400).send({ error: "Invalid credentials" });
    }

    // compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return resp.status(400).send({ error: "Invalid credentials" });
    }

    // generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      "SECRET_KEY", // ⚠️ move this to .env in production
      { expiresIn: "1h" }
    );

    resp.send({ message: "Login successful", token });
  } catch (err) {
    resp.status(500).send({ error: err.message });
  }
});

// ----------------------
// Start Server
// ----------------------
app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});
