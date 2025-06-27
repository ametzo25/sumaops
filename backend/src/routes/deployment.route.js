const express = require('express');
const router = express.Router();
const { getAllDeployments } = require('../controllers/deployment.controller');

router.get('/', getAllDeployments);

module.exports = router;
