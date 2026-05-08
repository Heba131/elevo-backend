const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // أضفنا هذه المكتبة لإنشاء هوية المستخدم (Token)

// 1. تسجيل مستخدم جديد (Register)
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // تشفير كلمة السر
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: "تم إنشاء المستخدم بنجاح!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. تسجيل الدخول (Login) - 
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // البحث عن المستخدم ببريده الإلكتروني
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "المستخدم غير موجود" });

        // مقارنة كلمة السر المدخلة مع المشفرة في القاعدة
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "كلمة السر غير صحيحة" });

        // إنشاء التوكن (JWT) ليبقى المستخدم مسجلاً دخوله
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ 
            token, 
            user: { id: user._id, username: user.username, email: user.email } 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;