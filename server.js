const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const Product = require('./models/Product'); 

dotenv.config();
const app = express();

// --- [الخطوة 4: البرمجيات الوسيطة - Logger Middleware] ---
const requestLogger = (req, res, next) => {
    const time = new Date().toLocaleString('ar-JO');
    
    if (req.url.includes('/api/products')) {
        console.log(`-----------------------------------------`);
        console.log(`[LOG]: محاولة الوصول للمنتجات أو إضافتها!`);
        console.log(`[TIME]: ${time}`);
        console.log(`[METHOD]: ${req.method} | [URL]: ${req.url}`);
        console.log(`-----------------------------------------`);
    }
    next(); 
};

// Middlewares
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/auth', authRoutes);

// مسار جلب المنتجات (الرئيسي)
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// مسار إضافة المنتجات الـ 10 (Seed)
app.get('/api/products/seed', async (req, res) => {
    try {
        const initialProducts = [
            { name: 'iPhone 15 Pro', category: 'Phones', price: 999, image: 'https://images.pexels.com/photos/18525574/pexels-photo-18525574.jpeg' },
            { name: 'MacBook Air M2', category: 'Laptops', price: 1199, image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=800&auto=format&fit=crop' },
            { name: 'Sony Headphones', category: 'Accessories', price: 350, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
            { name: 'Samsung Galaxy S24', category: 'Phones', price: 899, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400' },
            { name: 'Logitech Mouse', category: 'Accessories', price: 49, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400' },
            { name: 'Dell XPS Laptop', category: 'Laptops', price: 1299, image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400' },
            { name: 'Smart Fitness Watch', category: 'Watches', price: 199, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500&auto=format&fit=crop' },
            { name: 'Gaming Keyboard', category: 'Accessories', price: 120, image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400' },
            { name: '4K Gaming Monitor', category: 'Screens', price: 450, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400' },
            { name: 'iPad Pro M2', category: 'Tablets', price: 799, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400' }
        ];
        
        await Product.deleteMany({}); 
        await Product.insertMany(initialProducts);
        res.json({ message: "✅ تم تحديث قاعدة البيانات بـ 10 منتجات بنجاح!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// الاتصال بـ MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ متصل بقاعدة البيانات بنجاح"))
    .catch((err) => console.log("❌ فشل الاتصال:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`));