const Task = require('../models/AssignedTask');

// ✅ Assign Task Controller
const assignTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      targetDate,
      assignedBy,
      specialty,
      assignmentType,
      department,
      selectedStudents
    } = req.body;

    // Basic validation
    if (!title || !priority || !targetDate || !assignedBy || !assignmentType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newTask = new Task({
      title,
      description,
      priority,
      targetDate,
      assignedBy,
      specialty,
      assignmentType,
      department: assignmentType === "department" ? department : null,
      assignedTo: assignmentType === "students" ? selectedStudents : [], // ✅ use assignedTo
    });

    await newTask.save();
    return res.status(201).json({ message: "Task assigned successfully", task: newTask });

  } catch (err) {
    console.error("Assign Task Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Get Tasks Controller (Filter by doctor/specialty/assignedTo)
const getTasksByDoctor = async (req, res) => {
  try {
    const { assignedBy, specialty, assignedTo } = req.query;

    if (!assignedBy && !specialty) {
      return res.status(400).json({ message: 'assignedBy or specialty is required' });
    }

    const query = {};
    if (assignedBy) query.assignedBy = assignedBy;
    if (specialty) query.specialty = specialty;
    if (assignedTo) query.selectedStudents = assignedTo;

    const tasks = await Task.find(query);
    res.status(200).json(tasks);

  } catch (error) {
    console.error('Error fetching tasks:', error.message);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
};

module.exports = {
  assignTask,
  getTasksByDoctor,
};
