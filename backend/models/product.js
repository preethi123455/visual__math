const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    email: { type: String, required: true },  // ✅ Ensure this matches frontend
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
});

module.exports = mongoose.model('CartItem', cartItemSchema);
