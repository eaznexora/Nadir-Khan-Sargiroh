const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    nameEn: { type: String, required: true, unique: true },
    nameUr: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);