const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Import Routes
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const messageRoutes = require("./routes/messageRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

// Use Routes
app.use("/auth", authRoutes);
app.use("/items", itemRoutes);
app.use("/messages", messageRoutes);
app.use("/upload", uploadRoutes);

// Deploy as Firebase Function
exports.api = functions.https.onRequest(app);

