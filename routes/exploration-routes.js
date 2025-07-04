const express = require('express');
const router = express.Router();
const upload = require('../config/multer-config');
const { verifyAuth, verifyAdmin } = require('../utils/auth-middleware');
const {
    submitLocationExploration,
    checkExplorationStatus,
    getUserExplorations,
    getUserLevelInfo,
    getAllExplorations,
    getExplorationsByStatus,
    approveExploration,
    rejectExploration,
    getExplorationImages
} = require('../controllers/exploration-controller');

///user routes
router.post('/locations/:locationId/explore', verifyAuth, upload.array('photos', 5), submitLocationExploration);
router.get('/locations/:locationId/exploration-status', verifyAuth, checkExplorationStatus);
router.get('/explorations', verifyAuth, getUserExplorations);
router.get('/level-info', verifyAuth, getUserLevelInfo);

///admin routes
router.get('/admin/explorations', verifyAdmin, getAllExplorations);
router.get('/admin/explorations/status/:status', verifyAdmin, getExplorationsByStatus);
router.post('/admin/explorations/:explorationId/approve', verifyAdmin, approveExploration);
router.post('/admin/explorations/:explorationId/reject', verifyAdmin, rejectExploration);
router.get('/admin/explorations/:explorationId/images', verifyAdmin, getExplorationImages);

module.exports = router;