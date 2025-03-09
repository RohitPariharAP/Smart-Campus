const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Name is required"] 
    },
    email: { 
      type: String, 
      required: [true, "Email is required"],
      unique: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please use a valid email address']
    },
    password: { 
      type: String, 
      required: [true, "Password is required"],
      select: false // Always exclude by default
    },
    role: { 
      type: String, 
      enum: ["teacher", "student"], 
      default: "student",
      index: true
    },
    contact: {
      type: String,
      validate: {
        validator: function(v) {
          return /\d{10}/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      }
    },
    attendance: [
      {
        date: Date,
        status: { 
          type: String, 
          enum: ["present", "absent"] 
        },
      },
    ],
    changedPasswordAt: Date
  },
  { 
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Password change tracking method
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.changedPasswordAt) {
    const changedTimestamp = parseInt(
      this.changedPasswordAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Hash password before saving
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 12);
    
    if (!this.isNew) {
      this.changedPasswordAt = Date.now() - 1000;
    }
    
    next();
  } catch (err) {
    next(err);
  }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema);