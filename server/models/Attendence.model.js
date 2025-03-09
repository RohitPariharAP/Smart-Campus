const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, "Date is required"],
    unique: true,
    index: true, // Faster querying by date
    validate: {
      validator: function(v) {
        // Ensure date is stored as YYYY-MM-DD without time
        return v.toISOString().split('T')[0] === this.date.toISOString().split('T')[0];
      },
      message: "Date must be a full day (no time component)"
    }
  },
  students: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Student reference is required"]
      },
      status: {
        type: String,
        enum: {
          values: ["present", "absent"],
          message: "Status must be either 'present' or 'absent'"
        },
        default: "absent"
      },
    },
  ],
}, { 
  timestamps: true,
  toJSON: { virtuals: true }, // For potential virtuals
  toObject: { virtuals: true }
});

// Index for faster date-based queries
attendanceSchema.index({ date: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);