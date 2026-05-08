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
    
    // مراقبة أي طلب يحتوي على كلمة products (سواء GET أو POST)
    if (req.url.includes('/api/products')) {
        console.log(`-----------------------------------------`);
        console.log(`[LOG]: محاولة الوصول للمنتجات أو إضافتها!`);
        console.log(`[TIME]: ${time}`);
        console.log(`[METHOD]: ${req.method} | [URL]: ${req.url}`);
        console.log(`-----------------------------------------`);
    }
    next(); 
};
// ---------------------------------------------------------

// Middlewares
app.use(cors());
app.use(express.json());
app.use(requestLogger); // تفعيل المراقب هنا قبل المسارات

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

// تعديل المسار من post إلى get ليعمل من المتصفح مباشرة
app.get('/api/products/seed', async (req, res) => {
    try {
        const initialProducts = [
            { name: 'iPhone 15 Pro', category: 'Phones', price: 999, image: 'https://images.pexels.com/photos/18525574/pexels-photo-18525574.jpeg' },
            { name: 'MacBook Air M2', category: 'Laptops', price: 1199, image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=800&auto=format&fit=crop' },
            { name: 'Sony Headphones', category: 'Accessories', price: 350, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
            { name: 'Samsung Galaxy S24', category: 'Phones', price: 899, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400' },
            { name: 'Smart Fitness Watch', category: 'Watches', price: 199, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500&auto=format&fit=crop' }
        ];
        
        // مسح المنتجات القديمة أولاً لتجنب التكرار (اختياري)
        await Product.deleteMany({}); 
        
        await Product.insertMany(initialProducts);
        res.json({ message: "تمت إضافة المنتجات بنجاح! تحقق من الـ Terminal لرؤية الـ Log" });
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