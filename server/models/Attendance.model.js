const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
  student: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Student ID is required'],
    index: true 
  },
  classSubject: { // Assuming a simple string for now. Could be a ref if you have a Class/Subject model.
    type: String,
    required: [true, 'Class/Subject is required'],
    trim: true,
    index: true
  },
  date: { 
    type: Date, 
    required: [true, 'Date is required'],
    // Set time to midnight UTC for consistent date comparison
    set: (d) => {
        const date = new Date(d);
        date.setUTCHours(0, 0, 0, 0);
        return date;
    },
    index: true
  },
  status: { 
    type: String, 
    enum: ['present', 'absent'], 
    required: [true, 'Status is required'] 
  },
  markedBy: { // Teacher who marked/updated the attendance
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Teacher ID is required'] 
  },
  markedAt: { // Timestamp of when it was marked/updated
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure a student can only have one record per class/subject per day
attendanceSchema.index({ student: 1, date: 1, classSubject: 1 }, { unique: true });

// Add index for efficient querying by teacher and date
attendanceSchema.index({ markedBy: 1, date: 1 });

// Update markedAt timestamp whenever the document is modified
attendanceSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.markedAt = Date.now();
  }
  next();
});

// Ensure findOneAndUpdate also updates the markedAt field
attendanceSchema.pre('findOneAndUpdate', function(next) {
  this.set({ markedAt: Date.now() });
  next();
});


module.exports = mongoose.model('Attendance', attendanceSchema);