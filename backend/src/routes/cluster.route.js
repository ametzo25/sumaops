const express = require('express');
const router = express.Router();
const clusterController = require('../controllers/cluster.controller');
const { getClusterStats } = require('../controllers/cluster.controller');

router.get('/workloads', clusterController.getWorkloads);
router.get('/namespaces', clusterController.getNamespaces);
router.get('/stats', getClusterStats);

module.exports = router;
