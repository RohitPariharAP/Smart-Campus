const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        minlength: [3, "Title must be at least 3 characters"]
    },
    subject: {
        type: String,
        required: [true, "Subject is required"],
        index: true // For faster subject filtering
    },
    fileUrl: {
        type: String,
        required: [true, "File URL is required"],
        validate: {
            validator: function(v) {
                // Allow either a full URL or a relative path (starting with '/')
                return /^(http|https):\/\/[^ "]+$|^\/.+/.test(v);
              },
              
            message: props => `${props.value} is not a valid URL!`
        }
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Uploader reference is required"],
        index: true
    },
    description: {
        type: String,
        maxlength: [500, "Description cannot exceed 500 characters"]
    },
    downloads: {
        type: Number,
        default: 0,
        min: [0, "Downloads cannot be negative"]
    }
}, { 
    timestamps: true, // Replaces manual createdAt
    toJSON: {
        transform: function(doc, ret) {
            delete ret.__v; // Remove version key
            return ret;
        }
    }
});

// Compound index for common queries
noteSchema.index({ subject: 1, createdAt: -1 });

module.exports = mongoose.model('Note', noteSchema);