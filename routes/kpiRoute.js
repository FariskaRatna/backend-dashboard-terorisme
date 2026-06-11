const express = require('express');
const router = express.Router();
const kpiController = require('../controllers/kpiController');

router.get('/total-putusan', kpiController.getTotalPutusan);
router.get('/eksekusi-rencana', kpiController.getEksekusiRencana);
router.get('/sumber-radikalisasi', kpiController.getSumberRadikalisasi);

module.exports = router;