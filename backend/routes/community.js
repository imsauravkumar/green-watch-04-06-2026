import express from 'express';
import { protect } from '../middleware/auth.js';
import { isMockDb, getMockDb, writeMockDb } from '../config/db.js';
import CommunityPost from '../models/CommunityPost.js';

const router = express.Router();

// @desc    Get all community posts
// @route   GET /api/community
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    if (isMockDb) {
      const db = getMockDb();
      return res.json(db.communityPosts || []);
    } else {
      const posts = await CommunityPost.find({}).sort({ createdAt: -1 });
      return res.json(posts);
    }
  } catch (error) {
    console.error("Fetch Forum Error:", error);
    res.status(500).json({ message: "Server error fetching community posts", error: error.message });
  }
});

// @desc    Create a community post
// @route   POST /api/community
// @access  Private
router.post('/', protect, async (req, res) => {
  const { title, content, category } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and Content are required" });
  }

  try {
    const authorId = req.user.id || req.user._id?.toString();
    const authorName = req.user.name;
    const authorRole = req.user.role;

    if (isMockDb) {
      const db = getMockDb();
      const newPost = {
        id: `post-${Date.now()}`,
        title,
        content,
        category: category || "General",
        authorId,
        authorName,
        authorRole,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString()
      };

      if (!db.communityPosts) db.communityPosts = [];
      db.communityPosts.push(newPost);
      writeMockDb(db);

      return res.status(201).json(newPost);
    } else {
      const post = await CommunityPost.create({
        title,
        content,
        category: category || "General",
        authorId,
        authorName,
        authorRole
      });

      return res.status(201).json(post);
    }
  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({ message: "Server error creating post", error: error.message });
  }
});

// @desc    Like/Unlike a post
// @route   POST /api/community/:id/like
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id || req.user._id?.toString();

  try {
    if (isMockDb) {
      const db = getMockDb();
      const post = db.communityPosts.find(p => p.id === postId);

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      if (!post.likes) post.likes = [];
      const userIndex = post.likes.indexOf(userId);

      if (userIndex === -1) {
        post.likes.push(userId); // Like
      } else {
        post.likes.splice(userIndex, 1); // Unlike
      }

      writeMockDb(db);
      return res.json({ likes: post.likes });
    } else {
      const post = await CommunityPost.findById(postId);

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const userIndex = post.likes.indexOf(userId);

      if (userIndex === -1) {
        post.likes.push(userId);
      } else {
        post.likes.splice(userIndex, 1);
      }

      await post.save();
      return res.json({ likes: post.likes });
    }
  } catch (error) {
    console.error("Like Post Error:", error);
    res.status(500).json({ message: "Server error liking post", error: error.message });
  }
});

// @desc    Add a comment to a post
// @route   POST /api/community/:id/comment
// @access  Private
router.post('/:id/comment', protect, async (req, res) => {
  const postId = req.params.id;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Comment content is required" });
  }

  try {
    const authorId = req.user.id || req.user._id?.toString();
    const authorName = req.user.name;
    const authorRole = req.user.role;

    if (isMockDb) {
      const db = getMockDb();
      const post = db.communityPosts.find(p => p.id === postId);

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      const newComment = {
        id: `cmt-${Date.now()}`,
        authorId,
        authorName,
        authorRole,
        content,
        createdAt: new Date().toISOString()
      };

      if (!post.comments) post.comments = [];
      post.comments.push(newComment);
      writeMockDb(db);

      return res.status(201).json(post);
    } else {
      const post = await CommunityPost.findById(postId);

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      post.comments.push({
        authorId,
        authorName,
        authorRole,
        content
      });

      const updatedPost = await post.save();
      return res.status(201).json(updatedPost);
    }
  } catch (error) {
    console.error("Comment Post Error:", error);
    res.status(500).json({ message: "Server error commenting on post", error: error.message });
  }
});

export default router;
