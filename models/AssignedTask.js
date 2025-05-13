const mongoose = require('mongoose');

const assignedTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  targetDate: {
    type: Date,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  assignedBy: {
    type: String,  // The email of the doctor
    required: true
  },
    specialty: {
    type: String,  // The specialty of the doctor
    required: true,
  },
  dateAssigned: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AssignedTask', assignedTaskSchema);
