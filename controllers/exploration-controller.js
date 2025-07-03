const User = require('../models/user-model');
const Exploration = require('../models/exploration-model');
const Upload = require('../models/upload-model');
const Location = require('../models/location-model');
const jwt = require('jsonwebtoken');

const EXP_VALUES = {
    LOCATION_REQUEST: 100,
    LOCATION_EXPLORATION: 50
};

const calculateRequiredExp = (level) => {
    if (level === 1) return 50;
    return Math.floor(50 * Math.pow(1.5, level - 1));
};

const calculateTotalExpForLevel = (targetLevel) => {
    let totalExp = 0;
    for (let level = 1; level < targetLevel; level++) 
    {
        totalExp += calculateRequiredExp(level);
    }
    return totalExp;
};

const getUserFromToken = (req) => {
    const token = req.cookies.token;
    if (!token) 
    {
        throw new Error('No token provided');
    }
    
    try 
    {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        return decoded;
    } 
    catch (error) 
    {
        throw new Error('Invalid token');
    }
};

const awardExperience = async (userId, expAmount, explorationType) => {
    try 
    {
        const user = await User.findById(userId);
        if (!user) 
        {
            throw new Error('User not found');
        }

        const oldLevel = user.level;
        const oldExp = user.experience;
        
        user.experience += expAmount;
        
        let newLevel = user.level;
        let totalExpForCurrentLevel = calculateTotalExpForLevel(newLevel);
        
        while (user.experience >= totalExpForCurrentLevel + calculateRequiredExp(newLevel)) ///level up
        {
            newLevel++;
            totalExpForCurrentLevel = calculateTotalExpForLevel(newLevel);
        }
        
        user.level = newLevel;
        await user.save();
        
        const leveledUp = newLevel > oldLevel;
        
        return {
            success: true,
            oldLevel,
            newLevel,
            oldExp,
            newExp: user.experience,
            expGained: expAmount,
            leveledUp,
            expToNextLevel: calculateRequiredExp(newLevel),
            expProgressToNext: user.experience - calculateTotalExpForLevel(newLevel)
        };
    } 
    catch (error) 
    {
        console.error('Error awarding experience:', error);
        throw error;
    }
};

const submitLocationExploration = async (req, res) => {
    try 
    {
        const { locationId } = req.params;
        
        const userToken = getUserFromToken(req);
        const userId = userToken.id;
        const username = userToken.username;

        ///validation
        let description = req.body.description || '';
        let rating = req.body.rating;

        if (Array.isArray(description)) 
        {
            description = description[0] || '';
        }
        if (Array.isArray(rating)) 
        {
            rating = rating[0];
        }

        if (rating) 
        {
            rating = parseInt(rating);
            if (isNaN(rating) || rating < 1 || rating > 5) 
            {
                return res.status(400).json({ 
                    error: 'Rating must be a number between 1 and 5' 
                });
            }
        } 
        else
        {
            rating = null;
        }

        console.log('Exploration request:', { locationId, userId, username, description, rating });
        console.log('Uploaded files:', req.files);

        if (!req.files || req.files.length === 0) 
        {
            return res.status(400).json({ 
                error: 'Photos are required for location exploration' 
            });
        }

        const location = await Location.findById(locationId);///does location exist?
        if (!location) 
        {
            return res.status(404).json({ error: 'Location not found' });
        }

        const existingApprovedExploration = await Exploration.findOne({
            user_id: userId,
            location_id: locationId,
            status: 'approved'
        });

        if (existingApprovedExploration) 
        {
            return res.status(400).json({ 
                error: 'You have already explored this location' 
            });
        }

        const pendingExploration = await Exploration.findOne({///no duplicates
            user_id: userId,
            location_id: locationId,
            status: 'pending'
        });

        if (pendingExploration) 
        {
            return res.status(400).json({ 
                error: 'You already have a pending exploration for this location awaiting approval' 
            });
        }

        const photos = [];
        for (const file of req.files) 
        {
            const upload = new Upload({
                filename: file.filename,
                original_name: file.originalname,
                path: `/uploads/${file.filename}`,
                size: file.size,
                mimetype: file.mimetype,
                uploaded_by: username,
                location_id: locationId
            });

            const savedUpload = await upload.save();
            photos.push({
                filename: file.filename,
                path: `/uploads/${file.filename}`,
                original_name: file.originalname
            });
        }

        const exploration = new Exploration({
            user_id: userId,
            username: username,
            location_id: locationId,
            location_name: location.name,
            exploration_type: 'location_exploration',
            exp_gained: EXP_VALUES.LOCATION_EXPLORATION,
            photos: photos,
            description: description,
            rating: rating,
            status: 'pending'
        });

        await exploration.save();

        res.status(201).json({
            message: `Exploration submitted successfully! Your photos are being reviewed by an admin. You'll receive ${EXP_VALUES.LOCATION_EXPLORATION} XP once approved.`,
            exploration: exploration,
            photosUploaded: photos.length,
            status: 'pending_approval'
        });

    } catch (error) 
    {
        console.error('Error submitting location exploration:', error);
        
        if (error.message === 'No token provided' || error.message === 'Invalid token') 
        {
            return res.status(401).json({ error: 'Please log in to explore locations' });
        }
        
        res.status(500).json({ 
            error: 'Error submitting exploration: ' + error.message 
        });
    }
};

const checkExplorationStatus = async (req, res) => {
    try 
    {
        const { locationId } = req.params;
        const userToken = getUserFromToken(req);
        const userId = userToken.id;

        const existingApprovedExploration = await Exploration.findOne({
            user_id: userId,
            location_id: locationId,
            status: 'approved'
        });

        const pendingExploration = await Exploration.findOne({
            user_id: userId,
            location_id: locationId,
            status: 'pending'
        });

        let status = 'can_explore';
        let message = 'You can explore this location';
        let exploration = null;

        if (existingApprovedExploration) 
        {
            status = 'already_explored';
            message = 'You have already explored this location and gained XP';
            exploration = existingApprovedExploration;
        } 
        else if (pendingExploration) 
        {
            status = 'pending_approval';
            message = 'Your exploration is pending admin approval';
            exploration = pendingExploration;
        }

        res.json({
            status: status,
            message: message,
            canExplore: status === 'can_explore',
            alreadyExplored: status === 'already_explored',
            pendingApproval: status === 'pending_approval',
            exploration: exploration
        });

    } 
    catch (error) 
    {
        console.error('Error checking exploration status:', error);
        
        if (error.message === 'No token provided' || error.message === 'Invalid token') 
        {
            return res.status(401).json({ error: 'Please log in to check exploration status' });
        }
        
        res.status(500).json({ error: 'Error checking exploration status' });
    }
};

const getUserExplorations = async (req, res) => {
    try 
    {
        const userToken = getUserFromToken(req);
        const userId = userToken.id;

        const explorations = await Exploration.find({ user_id: userId })
            .sort({ created_at: -1 })
            .populate('location_id', 'name latitude longitude');

        res.json(explorations);

    } 
    catch (error) 
    {
        console.error('Error fetching user explorations:', error);
        
        if (error.message === 'No token provided' || error.message === 'Invalid token') 
        {
            return res.status(401).json({ error: 'Please log in to view explorations' });
        }
        
        res.status(500).json({ error: 'Error fetching explorations' });
    }
};

const getUserLevelInfo = async (req, res) => {
    try 
    {
        const userToken = getUserFromToken(req);
        const userId = userToken.id;
        
        const user = await User.findById(userId);
        if (!user) 
        {
            return res.status(404).json({ error: 'User not found' });
        }

        const currentLevel = user.level;
        const currentExp = user.experience;
        const expForCurrentLevel = calculateTotalExpForLevel(currentLevel);
        const expForNextLevel = calculateRequiredExp(currentLevel);
        const expProgressToNext = currentExp - expForCurrentLevel;

        res.json({
            level: currentLevel,
            experience: currentExp,
            expForNextLevel: expForNextLevel,
            expProgressToNext: expProgressToNext,
            expProgressPercentage: Math.floor((expProgressToNext / expForNextLevel) * 100)
        });

    } 
    catch (error) 
    {
        console.error('Error fetching user level info:', error);
        
        if (error.message === 'No token provided' || error.message === 'Invalid token') 
        {
            return res.status(401).json({ error: 'Please log in to view level info' });
        }
        
        res.status(500).json({ error: 'Error fetching level info' });
    }
};

///for admin
const getAllExplorations = async (req, res) => {
    try 
    {
        const explorations = await Exploration.find()
            .sort({ created_at: -1 })
            .populate('location_id', 'name latitude longitude')
            .populate('user_id', 'username level');

        res.json(explorations);
    } 
    catch (error) 
    {
        console.error('Error fetching all explorations:', error);
        res.status(500).json({ error: 'Error fetching explorations' });
    }
};

const getExplorationsByStatus = async (req, res) => {
    try 
    {
        const { status } = req.params;
        const explorations = await Exploration.find({ status })
            .sort({ created_at: -1 })
            .populate('location_id', 'name latitude longitude')
            .populate('user_id', 'username level');

        res.json(explorations);
    } 
    catch (error) 
    {
        console.error('Error fetching explorations by status:', error);
        res.status(500).json({ error: 'Error fetching explorations' });
    }
};

const approveExploration = async (req, res) => {
    try 
    {
        const { explorationId } = req.params;
        const { admin_notes } = req.body;
        
        const exploration = await Exploration.findById(explorationId);
        if (!exploration) 
        {
            return res.status(404).json({ error: 'Exploration not found' });
        }
        
        if (exploration.status !== 'pending') 
        {
            return res.status(400).json({ error: 'Exploration is not pending' });
        }

        exploration.status = 'approved';
        exploration.admin_notes = admin_notes || '';
        exploration.reviewed_at = new Date();
        exploration.reviewed_by = 'admin';
        
        await exploration.save();

        const expResult = await awardExperience(
            exploration.user_id,
            exploration.exp_gained,
            exploration.exploration_type
        );

        console.log(`Approved exploration and awarded ${exploration.exp_gained} XP to ${exploration.username}`);

        res.json({
            message: `Exploration approved! ${exploration.username} has been awarded ${exploration.exp_gained} XP.`,
            exploration: exploration,
            expResult: expResult
        });

    } 
    catch (error) 
    {
        console.error('Error approving exploration:', error);
        res.status(500).json({ error: 'Error approving exploration' });
    }
};

const rejectExploration = async (req, res) => {
    try 
    {
        const { explorationId } = req.params;
        const { admin_notes } = req.body;
        
        const exploration = await Exploration.findById(explorationId);
        if (!exploration) 
        {
            return res.status(404).json({ error: 'Exploration not found' });
        }
        
        if (exploration.status !== 'pending') 
        {
            return res.status(400).json({ error: 'Exploration is not pending' });
        }

        exploration.status = 'rejected';
        exploration.admin_notes = admin_notes || '';
        exploration.reviewed_at = new Date();
        exploration.reviewed_by = 'admin';
        
        await exploration.save();

        if (exploration.photos && exploration.photos.length > 0) 
        {
            const filenames = exploration.photos.map(photo => photo.filename);
            await Upload.deleteMany({ filename: { $in: filenames } });
            console.log(`Deleted ${filenames.length} photos for rejected exploration`);
        }

        res.json({
            message: 'Exploration has been rejected.',
            exploration: exploration
        });

    } 
    catch (error) 
    {
        console.error('Error rejecting exploration:', error);
        res.status(500).json({ error: 'Error rejecting exploration' });
    }
};

const getExplorationImages = async (req, res) => {
    try 
    {
        const { explorationId } = req.params;
        const exploration = await Exploration.findById(explorationId);
        
        if (!exploration) 
        {
            return res.status(404).json({ error: 'Exploration not found' });
        }

        const images = await Upload.find({ 
            location_id: exploration.location_id,
            uploaded_by: exploration.username 
        });

        res.json(images);
    } 
    catch (error) 
    {
        console.error('Error fetching exploration images:', error);
        res.status(500).json({ error: 'Error fetching images' });
    }
};

module.exports = {
    submitLocationExploration,
    checkExplorationStatus,
    getUserExplorations,
    getUserLevelInfo,
    getAllExplorations,
    getExplorationsByStatus,
    approveExploration,
    rejectExploration,
    getExplorationImages,
    awardExperience,
    EXP_VALUES,
    calculateRequiredExp,
    calculateTotalExpForLevel
};