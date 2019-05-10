const jwt=require('jsonwebtoken');

module.exports=(req,res,next)=>{
    const authHeader=req.get('Authorization');
    if(!authHeader){
        const error=new Error('Not Authenticated');
        error.statusCode=401;
        throw error;
    }

  const token=req.get('Authorization').split(' ')[1];
  let decodeToken;
  try{
      decodeToken=jwt.verify(token,'somesecret');
  }catch (e) {
      e.statusCode=500;
      throw e;
  }
  if(!decodeToken){
      const error=new Error('Not Authenticated');
      error.statusCode=401;
      throw error;
  }
  req.userId=decodeToken.id;
  next();
};