// const express = require('express');
// const router = express.Router();
// const { assignTask, getTasksByDoctor } = require('../controllers/taskController'); 

// // Route: POST /assign-task
// router.post('/assign-task', assignTask);

// // Route: GET /tasks (Fetch tasks by assignedBy email)
// router.get('/tasks', getTasksByDoctor);

// module.exports = router;
// routes/tasks.js
const express = require('express');
const router = express.Router();
const { assignTask, getTasksByDoctor } = require('../controllers/taskController'); 

// Route: POST /assign-task
router.post('/assign-task', assignTask);

// Route: GET /tasks (Fetch tasks by assignedBy email)
router.get('/tasks', getTasksByDoctor);

module.exports = router;
