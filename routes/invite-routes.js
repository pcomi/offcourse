const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../utils/auth-middleware');
const {
    createInviteCode,
    getAllInvites,
    deleteInviteCode
} = require('../controllers/invite-controller');

router.post('/admin/invites', verifyAdmin, createInviteCode);
router.get('/admin/invites', verifyAdmin, getAllInvites);
router.delete('/admin/invites/:code', verifyAdmin, deleteInviteCode);

module.exports = router;