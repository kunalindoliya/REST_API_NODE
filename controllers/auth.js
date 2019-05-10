const User = require("../models/user");
const { validationResult } = require("express-validator/check");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    console.log(errors.array()[0]);
    throw error;
  }
  try {
    const hashValue = await bcrypt.hash(password, 10);
    await User.create({
      email: email,
      password: hashValue,
      name: name
    });
    res.status(201).json({ message: "signed up successfully!" });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.login =async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try{
    const user=await  User.findOne({ where: { email: email } });
    if (!user) {
      const error = new Error("Wrong email, User does not exist");
      error.statusCode = 401;
      throw error;
    }
    const isEqual=await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong password");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
        {
          email: user.email,
          id: user.id
        },
        "somesecret",
        { expiresIn: "1h" }
    );
    res.status(200).json({ token: token, userId: user.id });
  }catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};
