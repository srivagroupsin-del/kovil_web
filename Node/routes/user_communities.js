const express = require('express');
const router = express.Router();
const UserCommunityController = require('../model/user_communities');
const userCommunityController = new UserCommunityController();

router.post('/create', userCommunityController.CreateUserCommunity);
router.get('/', userCommunityController.GetUserCommunities);
router.delete('/delete/:id', userCommunityController.DeleteUserCommunity);

module.exports = router;
