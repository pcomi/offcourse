const express = require('express');
const router = express.Router();
const upload = require('../config/multer-config');
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
router.post('/locations/:locationId/explore', upload.array('photos', 5), submitLocationExploration);
router.get('/locations/:locationId/exploration-status', checkExplorationStatus);
router.get('/explorations', getUserExplorations);
router.get('/level-info', getUserLevelInfo);

///admin routes
router.get('/admin/explorations', getAllExplorations);
router.get('/admin/explorations/status/:status', getExplorationsByStatus);
router.post('/admin/explorations/:explorationId/approve', approveExploration);
router.post('/admin/explorations/:explorationId/reject', rejectExploration);
router.get('/admin/explorations/:explorationId/images', getExplorationImages);

module.exports = router;