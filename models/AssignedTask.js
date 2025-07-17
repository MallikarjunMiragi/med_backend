const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  priority: { type: String, required: true },
  targetDate: { type: Date, required: true },
  assignedBy: { type: String, required: true },
  specialty: String,
  assignmentType: { type: String, enum: ['department', 'students'], required: true },
  department: { type: String, default: null },
  assignedTo: [String], 

}, { timestamps: true });

module.exports = mongoose.model('AssignedTask', taskSchema);
