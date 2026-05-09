const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session'); 
const authRoutes = require('./routes/auth');
const Product = require('./models/Product'); 

dotenv.config();
const app = express();


app.use(express.json());
app.use(cors({
    origin: 'https://elevo-frontend.onrender.com', 
    credentials: true 
}));


app.use(session({
    secret: process.env.SESSION_SECRET || 'elevo_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure:true,
        sameSite: 'none',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 
    }
}));


const productLogger = (req, res, next) => {
    if (req.method === 'POST' && req.url.includes('/api/products')) {
        const time = new Date().toLocaleString('en-US');
        const userId = req.session.userId || 'Guest/Anonymous';
        
        console.log(`-----------------------------------------`);
        console.log(`[LOG]: NEW PRODUCT ADDED`);
        console.log(`[USER ID]: ${userId}`);
        console.log(`[TIME]: ${time}`);
        console.log(`-----------------------------------------`);
    }
    next();
};


const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    res.status(401).json({ message: "Unauthorized: Please login first" });
};


app.use('/api/auth', authRoutes);



app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().populate('createdBy', 'username');
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post('/api/products', isAuthenticated, productLogger, async (req, res) => {
    try {
        const { name, price, category, image, description } = req.body;
        const newProduct = new Product({
            name,
            price,
            category,
            image,
            description,
            createdBy: req.session.userId 
        });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


app.delete('/api/products/:id', isAuthenticated, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

       
        if (product.createdBy.toString() !== req.session.userId) {
            return res.status(403).json({ message: "Forbidden: You don't own this product" });
        }

        await product.deleteOne();
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));