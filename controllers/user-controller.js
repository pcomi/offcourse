const User = require('../models/user-model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validateInviteCode, useInviteCode } = require('./invite-controller');

exports.signup = async (req, res) => {
    const { username, password, email, inviteCode } = req.body;

    try {
        console.log('Signup request received:', { username, email, inviteCode: inviteCode ? '***' : 'none' });
        
        // Check if invite code is provided
        if (!inviteCode) {
            return res.status(400).json({ 
                message: 'Invite code is required. This is an invite-only platform.' 
            });
        }
        
        // Validate invite code
        const validInvite = await validateInviteCode(inviteCode);
        if (!validInvite) {
            return res.status(400).json({ 
                message: 'Invalid, expired, or already used invite code.' 
            });
        }
        
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists.' });
        }
        
        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email already exists.' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = new User({ 
            username, 
            password: hashedPassword, 
            email, 
            level: 1,
            experience: 0 
        });
        
        await newUser.save();
        
        // Mark invite code as used
        const usedInvite = await useInviteCode(inviteCode, username);
        if (!usedInvite) {
            // This shouldn't happen if validation passed, but just in case
            console.error('Failed to mark invite code as used after user creation');
        }

        // Include level and experience in the token (with fallbacks)
        const token = jwt.sign({ 
            id: newUser._id, 
            username: newUser.username,
            level: newUser.level || 1,
            experience: newUser.experience || 0
        }, process.env.SECRET_KEY, { expiresIn: '1h' });
        
        res.cookie('token', token, { httpOnly: false, secure: false });
        
        console.log(`User ${username} created successfully using invite code ${inviteCode}`);
        res.status(201).json({ 
            message: 'Account created successfully! Welcome to Off Course!' 
        });
        
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Server error during signup' });
    }
};

exports.signin = async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('Signin request received:', req.body);
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Include level and experience in the token (with fallbacks for existing users)
        const token = jwt.sign({ 
            id: user._id, 
            username: user.username,
            level: user.level || 1,
            experience: user.experience || 0
        }, process.env.SECRET_KEY, { expiresIn: '1h' });
        
        res.cookie('token', token, { httpOnly: false, secure: false });
        
        res.status(200).json({ message: 'Signin successful', user });
    } catch (error) {
        console.error('Error during signin:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.leaderboard = async (req, res) => {
    const { username, level } = req.body;

    try {
        console.log('Leaderboard request received:', req.body);
        const users = await User.find({ level: { $gte: 1 } }).sort({ level: -1 }).limit(5);
        res.json(users);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
};