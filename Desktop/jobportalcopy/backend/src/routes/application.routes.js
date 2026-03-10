const { Router } = require('express');
const {
  createApplication,
  getApplications,
  checkApplication,
} = require('../controllers/application.controller');

const router = Router();

// Create a new application
router.post('/', createApplication);

// Get all applications for a candidate
router.get('/:candidateId', getApplications);

// Check if candidate has applied to a job
router.get('/check/:candidateId/:jobId', checkApplication);

module.exports = router;
