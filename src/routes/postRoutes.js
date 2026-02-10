const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Imported all necessary controllers including updatePost
const { 
    createPost, 
    getPosts, 
    getPostById, 
    updatePost, 
    deletePost 
} = require('../controllers/postController');

// Configuration for Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'public/assets/uploads/'); },
    filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); }
});

const upload = multer({ storage });

// Define upload fields to match the Admin Panel FormData
const uploadFields = upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'files', maxCount: 10 },
    { name: 'thumbnail', maxCount: 1 }
]);

/* --- Routes --- */

// Public: Anyone can view posts
router.get('/', getPosts);
router.get('/:id', getPostById);

// Protected: server.js ensures only logged-in admins reach these
router.post('/', uploadFields, createPost); 
router.delete('/:id', deletePost);

// Handles full edits from the admin form
router.put('/:id', uploadFields, updatePost); 

// Handles quick pin/unpin or hide/unhide toggles from the management list
// Adding both PUT and PATCH ensures the "eye hide" toggle never fails
router.patch('/:id', uploadFields, updatePost); 

module.exports = router;