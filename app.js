const express=require('express');
const bodyParser=require('body-parser');
const feedRoutes=require('./routes/feed');
const sequelize=require('./util/database');
const Post=require('./models/post');

const app=express();
//middlewares
app.use(bodyParser.json());
app.use('/images',express.static('images'));
//handling CORS exceptions
app.use((req,res,next)=>{
   res.setHeader('Access-Control-Allow-Origin','*');
   res.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, PATCH, DELETE');
   res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');
   next();
});
app.use('/feed',feedRoutes);
app.use((error,req,res,next)=>{
   console.log(error);
   const status=error.statusCode || 500;
   const message=error.message;
   res.status(status).json({message:message});
});

sequelize
    //.sync({force:true})
    .sync()
    .then(result=>{
   app.listen(8080);
}).catch(err=>console.log(err));