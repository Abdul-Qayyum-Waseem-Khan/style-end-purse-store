const express = require('express');
const router = express.Router();
const { getCampaigns, createCampaign, sendCampaign, deleteCampaign } = require('../controllers/campaignController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getCampaigns)
  .post(createCampaign);

router.route('/:id/send')
  .post(sendCampaign);

router.route('/:id')
  .delete(deleteCampaign);

module.exports = router;
