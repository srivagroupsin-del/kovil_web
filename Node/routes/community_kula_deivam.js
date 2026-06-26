const express = require('express');
const router = express.Router();
const CommunityKulaDeivamController = require('../model/community_kula_deivam');
const controller = new CommunityKulaDeivamController();

router.post('/create', controller.CreateMapping);
router.put('/update/:id', controller.UpdateMapping);
router.get('/', controller.GetMappings);
router.delete('/delete/:id', controller.DeleteMapping);

module.exports = router;
