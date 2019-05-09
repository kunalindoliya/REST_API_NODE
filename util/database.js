const Sequelize=require('sequelize');

const sequelize=new Sequelize('node-complete-rest','root','root',{
    dialect:'mysql',
    host:'localhost'
});
module.exports=sequelize;