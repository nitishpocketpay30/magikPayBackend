const mongoose=require('mongoose');
const seedSuperAdmin = require('../seeders/adminSeeder');
const initMySQL = require('./mysqlConnection');
const initSequelize = require('./initSequelize');
const dotenv=require('dotenv').config()



const connectDB=async()=>{
    try{
      await mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
      console.log("Mongodb connected");
  await seedSuperAdmin();


    await initMySQL();       // optional if you use both pool and Sequelize
    await initSequelize();

    console.log('🏁 All DBs initialized successfully');

    }catch(err){
        console.log(`Error during mongodb connection ${err}`);
    }
}


module.exports=connectDB;