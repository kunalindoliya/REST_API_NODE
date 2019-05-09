const express=require('express');
const bodyParser=require('body-parser');
const feedRoutes=require('./routes/feed');
const sequelize=require('./util/database');
const uuidV4=require('uuid/v4');
const multer=require('multer');

const app=express();
const fileStorage=multer.diskStorage({
   destination:(req,file,cb)=>{
      cb(null,'images');
   },
   filename:(req,file,cb)=>{
      cb(null,uuidV4()+'-'+file.originalname);
   }
});
const fileFilter=(req,file,cb)=>{
  if(file.mimetype==='image/jpg'||file.mimetype==='image/png'||file.mimetype==='image/jpeg'){
     cb(null,true);
  } else{
     cb(null,false);
  }
};

//middlewares
app.use(bodyParser.json());
app.use('/images',express.static('images'));
app.use(multer({storage:fileStorage,fileFilter:fileFilter}).single('image'));

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