require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // For creating JWTs
const path = require('path');
const cors = require('cors'); // Import the cors package


const app = express();

app.use(cors()); // Enable CORS for all routes


const PORT = process.env.PORT || 3000; // Use environment port or 3000

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
              useNewUrlParser: true,
              useUnifiedTopology: true
          }).then(() => console.log('MongoDB Connected'))
              .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Secret key for JWTs
const JWT_SECRET = process.env.JWT_SECRET; // Replace with a strong, random secret

// Helper function to generate JWT
function generateToken(user) {
    return jwt.sign({ _id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' }); // Expires in 1 hour
}

// Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Missing token' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Forbidden: Invalid token' });
        }

        req.user = user; // Attach user info to the request
        next(); // Pass control to the next middleware
    });
}

// Signup Route
app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if username or email already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username or email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        // Save user to database
        await newUser.save();

        // Generate JWT token
        const token = generateToken(newUser);

        res.status(201).json({ success: true, message: 'User created successfully', token: token });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ success: false, message: 'Failed to create user' });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        // Generate JWT token
        const token = generateToken(user);

        res.status(200).json({ success: true, message: 'Login successful', token: token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Logout Route
app.post('/api/logout', (req, res) => {
    // Invalidate the token (if using a blacklist)
    // For example, add the token to a set of blacklisted tokens

    // Send a success response
    res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// Protected Route
app.get('/api/protected', authenticateToken, (req, res) => {
    // Access user information from req.user
    const username = req.user.username;

    res.status(200).json({ success: true, message: `Welcome, ${username}!`, data: { someProtectedInfo: 'This is protected data' } });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});