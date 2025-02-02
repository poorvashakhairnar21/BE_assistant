const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = "your-secret-key"; // In a real app, use an environment variable
const USER_FILE = "users.json";

// Helper function to read users from file
function readUsers() {
  if (!fs.existsSync(USER_FILE)) {
    return {};
  }
  const data = fs.readFileSync(USER_FILE, "utf8");
  return JSON.parse(data);
}

// Helper function to write users to file
function writeUsers(users) {
  fs.writeFileSync(USER_FILE, JSON.stringify(users, null, 2));
}

// Signup route
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();

  if (users[email]) {
    return res.status(403).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users[email] = {
    email,
    password: hashedPassword,
    chats: [],
  };

  writeUsers(users);

  const token = jwt.sign({ email }, SECRET_KEY);
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

  const token = jwt.sign({ email }, SECRET_KEY);
  res.json({ token });
});

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Protected route to get user chats
app.get("/chats", authenticateToken, (req, res) => {
  const users = readUsers();
  const user = users[req.user.email];
  res.json(user.chats);
});

// Protected route to update user chats
app.post("/chats", authenticateToken, (req, res) => {
  const users = readUsers();
  const user = users[req.user.email];
  user.chats = req.body.chats;
  writeUsers(users);
  res.json({ message: "Chats updated successfully" });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
