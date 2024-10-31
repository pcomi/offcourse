const User = require('../models/user-model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    const { username, password, email } = req.body;

    try 
    {
        console.log('Signup request received:', req.body);
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, email });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id, username: newUser.username }, process.env.SECRET_KEY, { expiresIn: '1h' });
        
        res.cookie('token', token, { httpOnly: false, secure: false });
        
        res.status(201).json({ message: 'User created successfully!' });
    } 
    catch (error) 
    {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Server error' });
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

        const token = jwt.sign({ id: user._id, username: user.username }, process.env.SECRET_KEY, { expiresIn: '1h' });
        
        res.cookie('token', token, { httpOnly: false, secure: false });
        
        res.status(200).json({ message: 'Signin successful', user });
    } 
    catch (error) 
    {
        console.error('Error during signin:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
