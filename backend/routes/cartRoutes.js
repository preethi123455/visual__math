const express = require('express');
const router = express.Router();
const Cart = require('../models/CartItem'); // Ensure this path is correct

router.post('/add', async (req, res) => {
    try {
        console.log("📥 Request Body:", req.body);

        const { userId, productId, name, price, quantity } = req.body;

        // Validate input
        if (!userId || !productId || !name || !price) {
            return res.status(400).json({ error: "Missing required fields: userId, productId, name, or price" });
        }

        // Check if the item already exists in the cart
        let existingCartItem = await Cart.findOne({ userId, productId });
        
        if (existingCartItem) {
            // If item exists, update the quantity
            existingCartItem.quantity += quantity || 1;
            await existingCartItem.save();
            console.log("🔄 Updated existing item in cart:", existingCartItem);
            return res.status(200).json({ message: "Item quantity updated in cart", item: existingCartItem });
        }

        // Create new cart item if it doesn't exist
        const newCartItem = new Cart({
            userId,
            productId,
            name,
            price,
            quantity: quantity || 1
        });

        await newCartItem.save();

        console.log("✅ Item added to cart:", newCartItem);
        res.status(201).json({ message: "Item added to cart", item: newCartItem });

    } catch (error) {
        console.error("❌ Error adding item to cart:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

module.exports = router;
