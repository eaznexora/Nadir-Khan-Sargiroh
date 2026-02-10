const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },
    content: { 
        type: String, 
        required: true 
    },
    category: { 
        type: String, 
        required: true 
    },
    imageUrl: { 
        type: mongoose.Schema.Types.Mixed 
    }, // Supports single string or array
    thumbnailUrl: { 
        type: String 
    },
    // Supports pinning posts to the top
    isPinned: { 
        type: Boolean, 
        default: false 
    },
    // FIXED: Added isHidden field to support privacy toggle
    isHidden: { 
        type: Boolean, 
        default: false 
    },
    date: { 
        type: String, 
        default: () => new Date().toLocaleDateString('en-GB') 
    }
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);