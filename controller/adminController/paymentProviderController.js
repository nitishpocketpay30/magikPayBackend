
// 🌐 Third-Party Dependencies
const bcrypt = require('bcrypt');
const createError = require('http-errors');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

// 🛠️ Internal Services & Utilities
const sendCredentialEmail = require('../../service/sendCredential');
const { sendOTPMPIN, sendOTPTXNPIN, sendOTPEmail } = require('../../service/sendMail');
const { generateRefreshToken, generateAccessToken, encryptDataFromText } = require('../../service/token');
const generatePassword = require('../../service/passwordGenerator');

// 👥 Models
const Admin = require('../../model/adminModel');
const AccessModule = require('../../model/accessModule');
const User = require('../../model/userModel');
const Provider = require('../../model/providerModel');


const addProvider = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            throw createError(403, 'Unauthorized user');
        }
        const { provider, access_key } = req.body;
        if (!provider) throw createError(400, 'provider is required');
        if (!access_key) throw createError(400, 'access key is required');
        const exists = await Provider.findOne({ where: { provider } });
        if (exists) {
            return res.status(409).json({
                status: 409,
                message: 'Provider already exists'
            });
        }
        const obj = {
            provider,
            access_key: encryptDataFromText(access_key),
            created_by: req.user.id,
            status: 1
        }
        const newProvider = await Provider.create(obj);
        if (!newProvider) throw createError(400, "provider creation failed")
        res.status(201).json({
            status: 201,
            message: 'Provider created successfully',
            data: newProvider
        });
    }
    catch (err) {
        next(err)
    }
}
const updateProvider = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 403, message: 'Forbidden' });
    }
    const { id } = req.params;
    const { provider, access_key, status } = req.body;

    const existing = await Provider.findByPk(id);
    if (!existing) return res.status(404).json({ status: 404, message: 'Provider not found' });

    const updates = {};
    if (provider) updates.provider = provider;
    if (access_key) updates.access_key = encryptDataFromText(access_key);
    if (status !== undefined) updates.status = status;

    await existing.update(updates);

    return res.json({ status: 200, message: 'Provider updated', data: existing });
  } catch (err) {
    next(err);
  }
};
const getProviders = async (req, res, next) => {
  try {
    // Only admins can access providers list
    if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 403, message: 'Forbidden' });
    }

    const providers = await Provider.findAll({
      attributes: ['id', 'provider', 'status', 'created_by', 'createdAt'],
      order: [['createdAt', 'DESC']],
      where:{
        status:1
      }
    });

    res.status(200).json({
      status: 200,
      message: 'Fetched providers successfully',
      data: providers
    });
  } catch (err) {
    next(err);
  }
};
const deleteProvider = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 403, message: 'Forbidden' });
    }

    const { id } = req.params;
    const provider = await Provider.findByPk(id);
    if (!provider) {
      return res.status(404).json({ status: 404, message: 'Provider not found' });
    }

    await provider.update({ status: 0 });

    res.status(200).json({ status: 200, message: 'Provider deactivated (soft deleted)' });
  } catch (err) {
    next(err);
  }
};
const assignProviderToUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw createError(403, 'Forbidden');
    }

    const { providerId, userId } = req.body;

    const [provider, user] = await Promise.all([
      Provider.findOne({ where: { id: providerId, status: 1 } }),
      User.findOne({ where: { id: userId, status: true } })
    ]);
    if (!provider) throw createError(404, 'Provider not found or inactive');
    if (!user) throw createError(404, 'User not found or inactive');

    const [assignment, created] = await ProviderUser.findOrCreate({
      where: { providerId, userId }
    });
    if (!created) {
      return res.status(200).json({
        status: 200,
        message: 'Provider already assigned to this user',
        data: assignment
      });
    }

    res.status(201).json({
      status: 201,
      message: 'Provider assigned to user successfully',
      data: assignment
    });
  } catch (err) {
    if (err.isJoi) return res.status(400).json({ status: 400, error: err.message });
    next(err);
  }
};
module.exports = {
    addProvider,
    updateProvider,
    getProviders,
    deleteProvider,
    assignProviderToUser
}