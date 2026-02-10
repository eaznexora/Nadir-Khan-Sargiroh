require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const fs = require('fs'); 

const app = express();

// --- 0. Ensure Uploads Folder Exists ---
const uploadDir = path.join(__dirname, 'public/assets/uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. Middlewares
app.use(cors({
    origin: true, 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- NUCLEAR REQUEST LOGGER ---
// This will print every image request to your VS Code terminal
app.use((req, res, next) => {
    if (req.url.includes('uploads') || req.url.includes('.jpg') || req.url.includes('.png')) {
        console.log(`📸 Image Requested: ${req.url}`);
    }
    next();
});

// 2. Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'nadir_khan_private_key', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// 3. Authentication Middleware
const checkAuth = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        if (req.originalUrl.startsWith('/api/')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        res.redirect('/login.html');
    }
};

// 4. Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ Connection Error:', err));

// 5. Controller Import
const postController = require('./src/controllers/postController');

// 6. Auth API Routes
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
        req.session.loggedIn = true;
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid Credentials' });
    }
});

app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
});

// 7. Category API Routes
app.get('/api/categories', postController.getCategories);
app.post('/api/categories', checkAuth, postController.addCategory);
app.delete('/api/categories/:id', checkAuth, postController.deleteCategory);

// 8. Post API Routes
app.use('/api/posts', (req, res, next) => {
    if (req.method === 'GET') return next();
    checkAuth(req, res, next); 
}, require('./src/routes/postRoutes'));

// 9. Protected Admin Page Routes
const adminPages = [
    'admin-panel.html', 
    'admin-index.html', 
    'admin-category.html', 
    'admin-form.html'
];

adminPages.forEach(page => {
    app.get(`/${page}`, checkAuth, (req, res) => {
        res.sendFile(path.join(__dirname, 'public', page));
    });
});

// 10. NUCLEAR STATIC MAPPING
// We are using path.join to make sure Windows/Mac differences don't break the path
app.use(express.static(path.join(__dirname, 'public')));

// This maps the URL "/assets/uploads" to the PHYSICAL folder "public/assets/uploads"
app.use('/assets/uploads', express.static(path.join(__dirname, 'public', 'assets', 'uploads')));

// This maps the URL "/uploads" to the same folder just in case
app.use('/uploads', express.static(path.join(__dirname, 'public', 'assets', 'uploads')));

// 11. Catch-all for HTML files
app.get('/:page', (req, res, next) => {
    const page = req.params.page;
    if (page.endsWith('.html')) {
        res.sendFile(path.join(__dirname, 'public', page));
    } else {
        next();
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server flying on http://localhost:${PORT}`);
});