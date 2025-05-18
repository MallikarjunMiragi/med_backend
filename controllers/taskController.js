// // // const Task = require('../models/AssignedTask');
// // // // Make sure the path is correct

// // // // Assign Task Controller
// // // const assignTask = async (req, res) => {
// // //   try {
// // //     const { title, description, priority, targetDate, department, assignedBy } = req.body;

// // //     // Basic validation (optional but good)
// // //     if (!title || !description || !priority || !targetDate || !department || !assignedBy) {
// // //       return res.status(400).json({ message: 'Please fill all fields' });
// // //     }

// // //     const newTask = new Task({
// // //       title,
// // //       description,
// // //       priority,
// // //       targetDate,
// // //       department,
// // //       assignedBy,
// // //     });

// // //     const savedTask = await newTask.save();

// // //     res.status(201).json({
// // //       message: 'Task assigned successfully',
// // //       task: savedTask
// // //     });

// // //   } catch (error) {
// // //     console.error('Error saving task:', error.message);
// // //     res.status(500).json({ message: 'Server error while assigning task' });
// // //   }
// // // };

// // // // Fetch tasks assigned by a specific doctor
// // // const getTasksByDoctor = async (req, res) => {
// // //   try {
// // //     const { assignedBy } = req.query;
// // //     if (!assignedBy) {
// // //       return res.status(400).json({ message: 'assignedBy parameter is required' });
// // //     }

// // //     const tasks = await Task.find({ assignedBy });
// // //     res.json(tasks);
// // //   } catch (error) {
// // //     console.error("Error fetching tasks:", error);
// // //     res.status(500).json({ message: 'Error fetching tasks' });
// // //   }
// // // };


// // // module.exports = { assignTask , getTasksByDoctor,};
// // const Task = require('../models/AssignedTask');

// // // Assign Task (existing function)
// // const assignTask = async (req, res) => {
// //   try {
// //     const { title, description, priority, targetDate, department, assignedBy } = req.body;

// //     // Basic validation (optional but good)
// //     if (!title || !description || !priority || !targetDate || !department || !assignedBy) {
// //       return res.status(400).json({ message: 'Please fill all fields' });
// //     }

// //     const newTask = new Task({
// //       title,
// //       description,
// //       priority,
// //       targetDate,
// //       department,
// //       assignedBy,
// //     });

// //     const savedTask = await newTask.save();

// //     res.status(201).json({
// //       message: 'Task assigned successfully',
// //       task: savedTask,
// //     });

// //   } catch (error) {
// //     console.error('Error saving task:', error.message);
// //     res.status(500).json({ message: 'Server error while assigning task' });
// //   }
// // };

// // // Fetch tasks assigned by a specific doctor
// // const getTasksByDoctor = async (req, res) => {
// //   try {
// //     const { assignedBy } = req.query;
// //     if (!assignedBy) {
// //       return res.status(400).json({ message: 'assignedBy parameter is required' });
// //     }

// //     const tasks = await Task.find({ assignedBy });
// //     res.json(tasks);
// //   } catch (error) {
// //     console.error("Error fetching tasks:", error.message);
// //     res.status(500).json({ message: 'Error fetching tasks' });
// //   }
// // };

// // module.exports = { assignTask, getTasksByDoctor };
// const Task = require('../models/AssignedTask');

// // Assign Task (existing function)
// const assignTask = async (req, res) => {
//   try {
//     const { title, description, priority, targetDate, department, assignedBy, specialty } = req.body;

//     // Basic validation (optional but good)
//     if (!title || !description || !priority || !targetDate || !department || !assignedBy || !specialty) {
//       return res.status(400).json({ message: 'Please fill all fields' });
//     }

//     const newTask = new Task({
//       title,
//       description,
//       priority,
//       targetDate,
//       department,
//       assignedBy,
//       specialty,
//     });

//     const savedTask = await newTask.save();

//     res.status(201).json({
//       message: 'Task assigned successfully',
//       task: savedTask,
//     });

//   } catch (error) {
//     console.error('Error saving task:', error.message);
//     res.status(500).json({ message: 'Server error while assigning task' });
//   }
// };

// module.exports = { assignTask };
// controllers/taskController.js
const Task = require('../models/AssignedTask');

// Assign Task (existing function)
const assignTask = async (req, res) => {
  try {
    const { title, description, priority, targetDate, department, assignedBy, specialty } = req.body;

    // Basic validation (optional but good)
    if (!title || !description || !priority || !targetDate || !department || !assignedBy || !specialty) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    const newTask = new Task({
      title,
      description,
      priority,
      targetDate,
      department,
      assignedBy,
      specialty,
    });

    const savedTask = await newTask.save();

    res.status(201).json({
      message: 'Task assigned successfully',
      task: savedTask,
    });

  } catch (error) {
    console.error('Error saving task:', error.message);
    res.status(500).json({ message: 'Server error while assigning task' });
  }
};

// ✅ Add this function
// const getTasksByDoctor = async (req, res) => {
//   try {
//     const assignedBy = req.query.assignedBy;
    
//     if (!assignedBy) {
//       return res.status(400).json({ message: 'AssignedBy email is required' });
//     }

//     const tasks = await Task.find({ assignedBy });
//     res.status(200).json(tasks);
    
//   } catch (error) {
//     console.error('Error fetching tasks:', error.message);
//     res.status(500).json({ message: 'Server error while fetching tasks' });
//   }
// };


// ✅ Updated getTasksByDoctor function (tasks filtered by specialty)
const getTasksByDoctor = async (req, res) => {
  try {
    const { assignedBy, specialty } = req.query;

    // Check if at least one filter is provided
    if (!assignedBy && !specialty) {
      return res.status(400).json({ message: 'AssignedBy or Specialty is required' });
    }

    // Build the query dynamically based on the provided filters
    const query = {};
    if (assignedBy) query.assignedBy = assignedBy;
    if (specialty) query.specialty = specialty;

    const tasks = await Task.find(query);
    res.status(200).json(tasks);
    
  } catch (error) {
    console.error('Error fetching tasks:', error.message);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
};
module.exports = { assignTask, getTasksByDoctor };