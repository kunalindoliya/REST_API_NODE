const { validationResult } = require("express-validator/check");
const Post = require("../models/post");
const path = require("path");
const fs = require("fs");
const User = require("../models/user");

exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.findAll();
    res.status(200).json({
      posts: posts
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("validation failed!");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  if (!req.file) {
    const error = new Error("No file found!");
    error.statusCode = 422;
    throw error;
  }
  try {
    const user = await User.findOne({ where: { id: req.userId } });
    const post = await user.createPost({
      title: title,
      content: content,
      imageUrl: req.file.path.replace("\\", "/"),
      creator: user.name
    });
    res.status(201).json({
      message: "Data added successfully!",
      post: post
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findByPk(postId);
    if (!post) {
      const error = new Error("Could not found post");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: "Post Fetched", post: post });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("validation failed!");
    error.statusCode = 422;
    throw error;
  }
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }
  if (!imageUrl) {
    const error = new Error("No file picked");
    error.statusCode = 422;
    throw error;
  }
  try {
    const post = await Post.findByPk(postId);
    if (!post) {
      const error = new Error("No post found!");
      error.statusCode = 422;
      throw error;
    }
    console.log(req.userId);
    if (post.userId !== req.userId) {
      const error = new Error("Not Authorized");
      error.statusCode = 403;
      throw error;
    }
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }
    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;
    const result = await post.save();
    res.status(200).json({ message: "Post updated successfully!", post: result });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.deletePost =async (req, res, next) => {
  const postId = req.params.postId;
  try{
    const post=await Post.findByPk(postId);
    if (!post) {
      const error = new Error("No post found!");
      error.statusCode = 422;
      throw error;
    }
    if (post.userId !== req.userId) {
      const error = new Error("Not Authorized");
      error.statusCode = 403;
      throw error;
    }
    clearImage(post.imageUrl);
    await post.destroy();
    res.status(200).json({ message: "Deleted post successfully!" });
  }catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

const clearImage = filePath => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, err => {
    if (err) console.log(err);
  });
};
