const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String }, // أضفتُ هذا السطر هنا لتتمكني من تخزين التصنيف
    description: { type: String },
    image: { type: String },
});

module.exports = mongoose.model('Product', productSchema);