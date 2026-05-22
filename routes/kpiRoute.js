const express = require('express');
const router = express.Router();
const kpiController = require('../controllers/kpiController');

router.get('/total-putusan', kpiController.getTotalPutusan);

module.exports = router;