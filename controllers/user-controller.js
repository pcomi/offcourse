const User = require('../models/user-model');

exports.signup = async (req, res) => {
    const { username, password, email } = req.body;

    try 
    {
        const existingUser = await User.findOne({ username });
        if (existingUser) 
        {
            return res.status(400).json({ message: 'Username already exists.' });
        }

        const newUser = new User({ username, password, email });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully!' });
    } 
    catch (error) 
    {
        res.status(500).json({ message: 'Server error' });
    }
};
