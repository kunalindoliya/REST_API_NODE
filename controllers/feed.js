const { validationResult } = require("express-validator/check");
const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  Post.findAll()
    .then(posts => {
      res.status(200).json({
        posts: posts
      });
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("validation failed!");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  Post.create({
    title: title,
    content: content,
    imageUrl: "images/indian skimmer.JPG",
    creator: "kunal"
  })
    .then(post => {
      res.status(201).json({
        message: "Data added successfully!",
        post: post
      });
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findByPk(postId)
    .then(post => {
      if (!post) {
        const error = new Error("Could not found post");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Post Fetched", post: post });
    })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};
