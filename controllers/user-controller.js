const User = require('../models/user-model');
const Location = require('../models/location-model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validateInviteCode, useInviteCode } = require('./invite-controller');

exports.signup = async (req, res) => {
    const { username, password, email, inviteCode } = req.body;

    try 
    {
        console.log('Signup request received:', { username, email, inviteCode: inviteCode ? '***' : 'none' });
        
        if (!inviteCode) 
        {
            return res.status(400).json({ 
                message: 'Invite code is required. This is an invite-only platform.' 
            });
        }
        
        const validInvite = await validateInviteCode(inviteCode);
        if (!validInvite) 
        {
            return res.status(400).json({ 
                message: 'Invalid, expired, or already used invite code.' 
            });
        }
        
        const existingUser = await User.findOne({ username });
        if (existingUser) 
        {
            return res.status(400).json({ message: 'Username already exists.' });
        }
        
        const existingEmail = await User.findOne({ email });
        if (existingEmail) 
        {
            return res.status(400).json({ message: 'Email already exists.' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({ 
            username, 
            password: hashedPassword, 
            email, 
            level: 1,
            experience: 0 
        });
        
        await newUser.save();
        
        const usedInvite = await useInviteCode(inviteCode, username);
        if (!usedInvite) 
        {
            console.error('Failed to mark invite code as used after user creation');
        }

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
        
    } 
    catch (error) 
    {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Server error during signup' });
    }
};

exports.signin = async (req, res) => {
    const { username, password } = req.body;

    try 
    {
        console.log('Signin request received:', req.body);
        const user = await User.findOne({ username });
        if (!user) 
        {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) 
        {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ 
            id: user._id, 
            username: user.username,
            level: user.level || 1,
            experience: user.experience || 0
        }, process.env.SECRET_KEY, { expiresIn: '1h' });
        
        res.cookie('token', token, { httpOnly: false, secure: false });
        
        res.status(200).json({ message: 'Signin successful', user });
    } 
    catch (error) 
    {
        console.error('Error during signin:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

///get top users by level and experience (main leaderboard endpoint)
exports.getTopUsers = async (req, res) => {
    try 
    {
        console.log('Fetching top users...');
        
        ///get top 10 users sorted by level (desc) then by experience (desc)
        const topUsers = await User.find({}, 'username level experience -_id')
            .sort({ level: -1, experience: -1 })
            .limit(10);
        
        console.log(`Found ${topUsers.length} top users`);
        res.json(topUsers);
    } 
    catch (error) 
    {
        console.error('Error fetching top users:', error);
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
};

///get top locations by score
exports.getTopLocations = async (req, res) => {
    try 
    {
        console.log('Fetching top locations...');
        
        ///get top 20 locations sorted by score (desc)
        const topLocations = await Location.find({}, 'name score address origin -_id')
            .sort({ score: -1 })
            .limit(20);
        
        console.log(`Found ${topLocations.length} top locations`);
        res.json(topLocations);
    } 
    catch (error) 
    {
        console.error('Error fetching top locations:', error);
        res.status(500).json({ message: 'Error fetching top locations' });
    }
};