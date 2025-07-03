const Invite = require('../models/invite-model');
const crypto = require('crypto');

function generateInviteCode() 
{
    return crypto.randomBytes(4).toString('hex').toUpperCase();
}

const createInviteCode = async (req, res) => {
    try 
    {
        const { created_by } = req.body;
        
        if (!created_by) 
        {
            return res.status(400).json({ error: 'Admin username is required' });
        }
        
        let code;
        let attempts = 0;
        
        do {
            code = generateInviteCode();
            attempts++;
            
            if (attempts > 10) 
            {
                throw new Error('Failed to generate unique invite code');
            }
        } 
        while (await Invite.findOne({ code }));
        
        const invite = new Invite({
            code,
            created_by
        });
        
        const savedInvite = await invite.save();
        
        res.status(201).json({
            message: `Invite code ${code} created successfully`,
            invite: savedInvite
        });
        
    } 
    catch (error) 
    {
        console.error('Error creating invite code:', error);
        res.status(500).json({ error: 'Error creating invite code: ' + error.message });
    }
};

const getAllInvites = async (req, res) => {
    try 
    {
        const invites = await Invite.find().sort({ created_at: -1 });
        res.json(invites);
    } 
    catch (error) 
    {
        console.error('Error fetching invites:', error);
        res.status(500).json({ error: 'Error fetching invite codes' });
    }
};

const deleteInviteCode = async (req, res) => {
    try 
    {
        const { code } = req.params;
        
        const deletedInvite = await Invite.findOneAndDelete({ code: code.toUpperCase() });
        
        if (!deletedInvite) 
        {
            return res.status(404).json({ error: 'Invite code not found' });
        }
        
        res.json({ message: `Invite code ${code} deleted successfully` });
    } 
    catch (error) 
    {
        console.error('Error deleting invite code:', error);
        res.status(500).json({ error: 'Error deleting invite code' });
    }
};

const validateInviteCode = async (code) => {
    try 
    {
        const invite = await Invite.findOne({ 
            code: code.toUpperCase(),
            is_used: false
        });
        return invite;
    } 
    catch (error) 
    {
        console.error('Error validating invite code:', error);
        return null;
    }
};

const useInviteCode = async (code, username) => {
    try 
    {
        const invite = await Invite.findOneAndUpdate(
            { 
                code: code.toUpperCase(),
                is_used: false
            },
            {
                is_used: true,
                used_by: username,
                used_at: new Date()
            },
            { new: true }
        );
        return invite;
    } 
    catch (error)
    {
        console.error('Error using invite code:', error);
        return null;
    }
};

module.exports = {
    createInviteCode,
    getAllInvites,
    deleteInviteCode,
    validateInviteCode,
    useInviteCode
};