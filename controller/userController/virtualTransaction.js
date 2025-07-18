
// 🌐 Third-Party Dependencies
const bcrypt = require('bcrypt');
const createError = require('http-errors');
const { Op } = require('sequelize');
const User = require('../../model/userModel');
const { sendTopUpToAdmin } = require('../../service/sendMail');
const { generateVirtualId } = require('../../service/token');
const VirtulaTransaction = require('../../model/virtualTransactionModel');


const requestTopUpByUser=async(req,res,next)=>{
try {
    const { amount } = req.body;
   const virtual_id=await generateVirtualId()
    const user = JSON.parse(JSON.stringify(await User.findByPk(req.user.id)));
    if (!user) return res.status(400).json({ status: 400, error: 'Invalid user_id' });

    const tx = await VirtulaTransaction.create({
      user_id:user.id,
      virtual_id,
      amount,
      approved_by: null, // or = req.user.id if logged-in admin
    });
    await sendTopUpToAdmin(false,user.email,{
        userName:user?.companyName,
        amount
    })

    res.status(201).json({
      status: 201,
      message: 'Top-up requested successfully',
      data: tx
    });
  } catch (err) {
    next(err);
  }
}
const approvedRequestByAdmin=async (req,res,next)=>{
    try{
    if (req.user.role !== 'admin'){
      return res
        .status(403)
        .json({ status: 403, message: 'Forbidden' });
    }
    const {amount}=req.body;
    if(!amount) throw createError(400,'ammount is required');
    }
    catch(err){
        next(err)
    }
}
module.exports = {
    requestTopUpByUser,
    approvedRequestByAdmin
}