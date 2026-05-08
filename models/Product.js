const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    image: { type: String }, // هنا سنضع رابط صورة المنتج
});

module.exports = mongoose.model('Product', productSchema);