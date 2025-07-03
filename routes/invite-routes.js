const express = require('express');
const router = express.Router();
const {
    createInviteCode,
    getAllInvites,
    deleteInviteCode
} = require('../controllers/invite-controller');

router.post('/admin/invites', createInviteCode);

router.get('/admin/invites', getAllInvites);

router.delete('/admin/invites/:code', deleteInviteCode);

module.exports = router;