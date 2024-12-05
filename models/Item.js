const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  studentID: {
    type: String, 
    required: true,
    trim: true
  },
  studentName: {
    type: String, 
    required: true,
    trim: true
  },
  course: {
    type: String, 
    required: true,
    trim: true
  },
  presentDate: {
    type: String, 
    required: true,
    trim: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

module.exports = mongoose.model('Item', ItemSchema);