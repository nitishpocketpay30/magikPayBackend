const mongoose=require('mongoose');
const seedSuperAdmin = require('../seeders/adminSeeder');
const dotenv=require('dotenv').config()
const initMySQL = require('./mysqlConnection');



const connectDB=async()=>{
    try{
      await mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
      console.log("Mongodb connected");
  await seedSuperAdmin();
      const mysqlPool = await initMySQL();

    }catch(err){
        console.log(`Error during mongodb connection ${err}`);
    }
}


module.exports=connectDB;