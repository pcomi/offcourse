const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
});

userSchema.pre('save', async function(next) 
{
    if (!this.isModified('password')) 
        return next();
    try 
    {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } 
    catch (error) 
    {
        next(error);
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;