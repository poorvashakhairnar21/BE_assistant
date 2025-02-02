const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = "your-secret-key"; // Store in env variable in real apps
const USER_FILE = "users.json";

// Helper function to read users from file
function readUsers() {
  if (!fs.existsSync(USER_FILE)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(USER_FILE, "utf8"));
}

// Helper function to write users to file
function writeUsers(users) {
  fs.writeFileSync(USER_FILE, JSON.stringify(users, null, 2));
}

// Generate JWT token with expiration
function generateToken(email) {
  return jwt.sign({ email }, SECRET_KEY, { expiresIn: "1h" });
}

// Signup route
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();

  if (users[email]) {
    return res.status(403).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users[email] = { email, password: hashedPassword, chats: [] };

  writeUsers(users);

  const token = generateToken(email);
  res.json({ token });
});

// Login route
app.post("/login", async (req, res) => {
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
