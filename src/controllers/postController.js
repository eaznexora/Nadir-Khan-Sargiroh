const Post = require('../models/Post');
const Category = require('../models/Category');

// 1. Create Post
const createPost = async (req, res) => {
    try {
        const { title, content, category, isPinned } = req.body;
        // Keep category as provided but use a lowercase version for logic checks
        const lowerCat = category.toLowerCase();
        let imageUrl = '';

        // Handle File Uploads
        if (req.files) {
            // Check for multiple files (Photo Gallery)
            if (req.files['files']) {
                imageUrl = req.files['files'].map(f => `/assets/uploads/${f.filename}`);
            } 
            // Check for single file (Article/Audio/Video)
            else if (req.files['file']) {
                imageUrl = `/assets/uploads/${req.files['file'][0].filename}`;
            }
        }

        const thumbnailUrl = (req.files && req.files['thumbnail']) 
            ? `/assets/uploads/${req.files['thumbnail'][0].filename}` 
            : '';

        const newPost = new Post({
            title,
            content,
            category: category.trim(), // Save the original category name
            imageUrl,
            thumbnailUrl,
            isPinned: isPinned === 'true' || isPinned === true 
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// 2. Get All Posts (With Flexible Search)
const getPosts = async (req, res) => {
    try {
        const { type, search } = req.query; 
        let query = {};

        // Flexible Category Matching: Handles "Photos" or "photo"
        if (type && type !== 'all') {
            query.category = { $regex: new RegExp(`^${type}$`, 'i') };
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        const posts = await Post.find(query).sort({ isPinned: -1, createdAt: -1 }); 
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Get Single Post
const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Not found" });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Update Post
const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        let updateData = { ...req.body };
        
        if (updateData.isPinned !== undefined) {
            updateData.isPinned = updateData.isPinned === 'true' || updateData.isPinned === true;
        }

        if (req.files) {
            if (req.files['files']) {
                updateData.imageUrl = req.files['files'].map(f => `/assets/uploads/${f.filename}`);
            } else if (req.files['file']) {
                updateData.imageUrl = `/assets/uploads/${req.files['file'][0].filename}`;
            }
            if (req.files['thumbnail']) {
                updateData.thumbnailUrl = `/assets/uploads/${req.files['thumbnail'][0].filename}`;
            }
        }

        const updatedPost = await Post.findByIdAndUpdate(id, updateData, { new: true });
        res.json(updatedPost);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// 5. Delete Post
const deletePost = async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- Category Functions ---
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const addCategory = async (req, res) => {
    try {
        // Safe formatting for English names (URL friendly)
        const safeNameEn = req.body.nameEn.toLowerCase().trim().replace(/\s+/g, '-');
        const newCat = new Category({
            nameEn: safeNameEn,
            nameUr: req.body.nameUr.trim()
        });
        await newCat.save();
        res.json(newCat);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

const deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: "Category Removed" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { 
    createPost, getPosts, getPostById, updatePost, deletePost, 
    getCategories, addCategory, deleteCategory 
};