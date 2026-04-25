const express = require('express');
const multer = require('multer');
const { predictDisease, predictCrop, predictRisk } = require('../controllers/predict.controller');

const router = express.Router();

// Memory storage for multer (buffer passed directly to Python)
const upload = multer({ storage: multer.memoryStorage() });

router.post('/disease', upload.single('image'), predictDisease);
router.post('/crop', predictCrop);
router.post('/risk', predictRisk);

module.exports = router;
