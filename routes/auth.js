const express=require('express');
const router=express.Router();
const authController=require('../controllers/auth');
const { body }=require('express-validator/check');
const User=require('../models/user');


router.put('/signup',[
    body('email','Please enter valid email address').isEmail().normalizeEmail()
        .custom((value,{req})=>{
            return User.findOne({where:{email:value}}).then(userDoc=>{
                if(userDoc)
                    return Promise.reject('Email address already  exits');
            });
        }),
    body('password').trim().isLength({min:5}),
    body('name').trim().not().isEmpty()
],authController.signup);

router.post('/login',authController.login);

module.exports=router;