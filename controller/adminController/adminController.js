
// 🌐 Third-Party Dependencies
const bcrypt = require('bcrypt');
const createError = require('http-errors');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

// 🛠️ Internal Services & Utilities
const sendCredentialEmail = require('../../service/sendCredential');
const { sendOTPMPIN, sendOTPTXNPIN, sendOTPEmail } = require('../../service/sendMail');
const { generateRefreshToken, generateAccessToken } = require('../../service/token');
const generatePassword = require('../../service/passwordGenerator');

// 👥 Models
const Admin = require('../../model/adminModel');
const AccessModule = require('../../model/accessModule');

const addStaffByAdmin = async (req, res, next) => {
    try {
        const {
            firstName,
            lastName,
            email,
            ip
        } = req.body;

        if (req.user.role !== "admin") {
            return res.status(403).json({ status: 403, message: 'Forbidden' });
        }

        const exists = await Admin.findOne({ where: { email } });
        if (exists) {
            return res.status(409).json({ status: 409, message: 'Email already in use' });
        }
        const password = generatePassword(12);
   
        const hashed = await bcrypt.hash(password, 12);

        const newStaff = await Admin.create({
            firstName,
            lastName,
            email,
            passwordHash: hashed,
            role: 2,
            ip,
            status: true
        });
        await sendCredentialEmail(email, { email, password })

        res.status(201).json({
            status: 201,
            message: 'Staff account created',
            data: {
                id: newStaff.id,
                firstName: newStaff.firstName,
                lastName: newStaff.lastName,
                email: newStaff.email,
                role: newStaff.role
            }
        });
    } catch (err) {
        next(err);
    }
};
const updateStaffByAdmin = async (req, res, next) => {
  try {
    // 📌 only admin can perform this action
    if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 403, message: 'Forbidden' });
    }

    const staffId = parseInt(req.params.id, 10);
    if (!staffId) {
      return res.status(400).json({ status: 400, message: 'Invalid staff ID' });
    }

    // 🔍 locate the user record first
    const staff = await Admin.findByPk(staffId);
    if (!staff) {
      return res.status(404).json({ status: 404, message: 'Staff not found' });
    }

    const allowed = ['firstName', 'lastName', 'email', 'status', 'ip'];
    allowed.forEach(key => {
      if (req.body[key] !== undefined) {
        staff[key] = req.body[key];
      }
    });

    // 📧 Check for email uniqueness
    if (req.body.email) {
      const emailExists = await Admin.findOne({
        where: { email: req.body.email, id: { [Op.ne]: staffId } }
      });
      if (emailExists) {
        return res.status(409).json({ status: 409, message: 'Email already in use' });
      }
    }

    // 💾 Save changes
    await staff.save();

    return res.status(200).json({
      status: 200,
      message: 'Staff updated successfully',
      data: {
        id: staff.id,
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        status: staff.status,
        ip: staff.ip,
        role: staff.role
      }
    });
  } catch (err) {
    next(err);
  }
};
const getAllStaff=async (req,res,next)=>{
    try{
    if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 403, message: 'Forbidden' });
    }
      const staffList = await Admin.findAll({
        attributes: { exclude: ['passwordHash'] }
      });
res.status(200).json({
    message:"staff list fetch successfully",
    status:200,
    data:staffList
})
    }
    catch(err){
        next(err)
    }
}
const getAllStaffById=async (req,res,next)=>{
    try{
        const {id}=req.params;
    if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 403, message: 'Forbidden' });
    }
      const staffList = await Admin.findOne({
        where:{
            id:id
        },
        attributes: { exclude: ['passwordHash'] }
      });
res.status(200).json({
    message:"staff list fetch successfully",
    status:200,
    data:staffList
})
    }
    catch(err){
        next(err)
    }
}
const createAccessModule = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 403, message: 'Forbidden: only admin' });
    }

    const {
      moduleName,
      moduleId,
      submoduleName,
      subModuleId,
      permissions = {},
      userType,
      userId
    } = req.body;

    // Input validation
    if (![moduleName, moduleId, submoduleName, subModuleId, userType, userId].every(v => v !== undefined)) {
      return res.status(400).json({ status: 400, message: 'Missing required fields' });
    }

    const existing = await AccessModule.findOne({
      where: {
        module_id: moduleId,
        sub_module_id: subModuleId,
        userType,
        userId
      }
    });

    if (existing) {
      return res.status(409).json({ status: 409, message: 'Access module already exists' });
    }

    const entry = await AccessModule.create({
      moduleName,
      module_id: moduleId,
      submoduleName,
      sub_module_id: subModuleId,
      create: !!permissions.create,
      read: !!permissions.read,
      update: !!permissions.update,
      delete: !!permissions.delete,
      userType,
      userId
    });


    res.status(201).json({ status: 201, message: 'Access module created', data: entry });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /access-modules/:id
 * Body: same as above (any subset allowed)
 */
const updateAccessModule = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 403, message: 'Forbidden: only admin' });
    }

    const id = parseInt(req.params.id, 10);
    const record = await AccessModule.findByPk(id);

    if (!record) {
      return res.status(404).json({ status: 404, message: 'Not found' });
    }

    const updates = {};
    ['moduleName', 'module_id', 'submoduleName', 'sub_module_id', 'userType', 'userId'].forEach(f => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    if (req.body.permissions) {
      ['create', 'read', 'update', 'delete'].forEach(p => {
        if (req.body.permissions[p] !== undefined) {
          updates[p] = !!req.body.permissions[p];
        }
      });
    }

    await record.update(updates);

    res.status(200).json({ status: 200, message: 'Access module updated', data: record });
  } catch (err) {
    next(err);
  }
};

module.exports = {
    addStaffByAdmin,
    updateStaffByAdmin,
    getAllStaff,
    getAllStaffById,
    createAccessModule,
    updateAccessModule
}