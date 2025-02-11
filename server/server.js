const express = require("express")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const fs = require("fs")
const cors = require("cors")
const nodemailer = require("nodemailer")
require("dotenv").config();

const app = express()
app.use(express.json())
app.use(cors())

const SECRET_KEY = process.env.SECRET_KEY // Store in env variable in real apps
const USER_FILE = process.env.USER_FILE
const OTP_EXPIRY = 10 * 60 * 1000 // 10 minutes

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Helper function to read users from file
function readUsers() {
  if (!fs.existsSync(USER_FILE)) {
    return {}
  }
  return JSON.parse(fs.readFileSync(USER_FILE, "utf8"))
}

// Helper function to write users to file
function writeUsers(users) {
  fs.writeFileSync(USER_FILE, JSON.stringify(users, null, 2))
}

// Generate JWT token with expiration
function generateToken(email) {
  return jwt.sign({ email }, SECRET_KEY, { expiresIn: "1h" })
}

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP via email
async function sendOTP(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Signup",
    text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
  }

  await transporter.sendMail(mailOptions)
}

// Signup route (first step)
app.post("/signup", async (req, res) => {
  const { email, password } = req.body
  // console.log(email,password)
  const users = readUsers()

  if (users[email] && users[email].verified) {
    return res.status(403).json({ error: "User already exists" })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const otp = generateOTP()
  const otpExpiry = Date.now() + OTP_EXPIRY

  users[email] = {
    email,
    password: hashedPassword,
    chats: [],
    otp,
    otpExpiry,
    verified: false,
  }

  writeUsers(users)

  await sendOTP(email, otp)

  res.json({ message: "OTP sent to your email" })
})

// OTP verification route
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body
  const users = readUsers()

  const user = users[email]
  if (!user) {
    return res.status(404).json({ error: "User not found" })
  }

  if (user.otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP" })
  }

  if (Date.now() > user.otpExpiry) {
    return res.status(400).json({ error: "OTP expired" })
  }

  user.verified = true
  delete user.otp
  delete user.otpExpiry

  writeUsers(users)

  const token = generateToken(email)
  res.json({ token })
})

// Login route
app.post("/login", async (req, res) => {
  // console.log(req.body)
  const { email, password } = req.body;
  const users = readUsers();

  const user = users[email];
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const token = generateToken(email);
  res.json({ token });
});

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });

    req.user = user;
    next();
  });
}

// Verify token endpoint
app.post("/verify-token", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });

    res.json({ email: decoded.email });
  });
});

// Get user chats
app.get("/chats", authenticateToken, (req, res) => {
  const users = readUsers();
  const user = users[req.user.email];
  res.json(user.chats);
});

// Update user chats
app.post("/chats", authenticateToken, (req, res) => {
  const users = readUsers();
  users[req.user.email].chats = req.body.chats;
  writeUsers(users);
  res.json({ message: "Chats updated successfully" });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
