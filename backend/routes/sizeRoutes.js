const express = require('express');
const router = express.Router();
const sizeController = require('../controllers/SizeController');

router.get('/getsizes', sizeController.getAllSizes);

router.post('/addsize', sizeController.createSize);

router.put('/updatesize/:id', sizeController.updateSize);

router.delete('/deletesize/:id', sizeController.deleteSize);

module.exports = router;