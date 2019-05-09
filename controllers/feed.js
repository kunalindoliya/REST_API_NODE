const { validationResult } = require("express-validator/check");
const Post = require("../models/post");
const path=require('path');
const fs=require('fs');

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
  if (!req.file) {
    const error = new Error("No file found!");
    error.statusCode = 422;
    throw error;
  }
  Post.create({
    title: title,
    content: content,
    imageUrl: req.file.path.replace("\\", "/"),
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

exports.updatePost = (req, res, next) => {
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
  Post.findByPk(postId)
    .then(post => {
      if(!post){
        const error=new Error('No post found!');
        error.statusCode=422;
        throw error;
      }
      if(imageUrl !== post.imageUrl){
        clearImage(post.imageUrl);
      }
      post.title=title;
      post.content=content;
      post.imageUrl=imageUrl;
      return post.save();
    })
      .then(result=>{
        res.status(200).json({message:'Post updated successfully!',post:result});
      })
    .catch(err => {
      if (!err.statusCode) err.statusCode = 500;
      next(err);
    });
};

exports.deletePost=(req,res,next)=>{
  const postId=req.params.postId;
  Post.findByPk(postId)
      .then(post=>{
        if(!post){
          const error=new Error('No post found!');
          error.statusCode=422;
          throw error;
        }
        clearImage(post.imageUrl);
        return post.destroy();
      })
      .then(result=>{
        res.status(200).json({message:'Deleted post successfully!'});
      })
      .catch(err=>{
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  })
};

const clearImage=filePath=>{
  filePath=path.join(__dirname,'..',filePath);
  fs.unlink(filePath,err=>{if(err)console.log(err)});
};
