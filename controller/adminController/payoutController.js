
// 🌐 Third-Party Dependencies
const createError = require('http-errors');

// 👥 Models
const User = require('../../model/userModel');
const { unPayPayout } = require('../../gateWayProviders/unPayProvider');
const sequelize = require('../../config/sequelize');
const Transaction = require('../../model/Transaction');
const { rechargeKitPayout } = require('../../gateWayProviders/rechargeKitPayout');
const aeronPayPayout = require('../../gateWayProviders/aeronpayProvider');
const { generateApiTxnId } = require('../../service/token');

const createPayoutByUser = async (req, res, next) => {
  try {
    if (req.user.role !== 'user') {
      throw createError(403, 'Forbidden: only users can initiate payouts');
    }

    const amount = parseFloat(req.body.transaction_amount);
    const txnId = generateApiTxnId();
    let bankParams = {};

    // 1️⃣ Step 1: Lock and Validate User
    const user = await sequelize.transaction(async t1 => {
      const user = await User.findByPk(req.user.id, {
        transaction: t1,
        lock: t1.LOCK.UPDATE,
      });
      if (!user) throw createError(404, 'User not found');

      if (user.topup < amount || user.topup === 0) {
        throw createError(400, 'Insufficient balance');
      }

      return user;
    });

    // 2️⃣ Step 2: Prepare Bank Params and Log Transaction (Intent)
    const transactionRecord = await sequelize.transaction(async t2 => {
      // Build bankParams based on provider
      if (req.body.providerKey === 'RECHARGEKIT_PAY') {
        bankParams = {
          mode: req.body.mode,
          name: req.body.beneficiaryname,
          account_no: req.body.account,
          bank_name: req.body.transfer_bank_name,
          ifsc: req.body.ifsc,
          mobile_no: req.body.mobile,
          beneficiary_name: req.body.beneficiaryname,
          amount,
          transfer_type: "5",
          partner_request_id: txnId
        };
      } else if (req.body.providerKey === 'AERON_PAY') {
        bankParams = {
          accountNumber: req.body.account,
          amount,
          apitxnid: txnId,
          transferMode: req.body.mode,
          remarks: 'imps',
          beneAccount: req.body.account,
          ifsc: req.body.ifsc,
          beneName: req.body.beneficiaryname,
          email: req.body.email,
          mobile: req.body.mobile,
          address: req.body.address
        };
      } else {
        bankParams = {
          mode: req.body.mode,
          name: req.body.beneficiaryname,
          account: req.body.account,
          bank: req.body.transfer_bank_name,
          ifsc: req.body.ifsc,
          mobile: req.body.mobile,
          amount,
          apitxnid: txnId
        };
      }

      const txn = await Transaction.create({
        user_id: req.user.id,
        transactionDate: new Date(),
        transactionId: txnId,
        gatwayId: txnId,
        orderId: txnId,
        mode: req.body.mode,
        bankDetails: bankParams,
        amount,
        status: 0, // INITIATE
        apiName: req.body.providerKey,
      }, { transaction: t2 });

      return txn;
    });

    // 3️⃣ Step 3: Execute External API and Final Update
    const result = await sequelize.transaction(async t3 => {
      let apiResult;
      if (req.body.providerKey === 'RECHARGEKIT_PAY') {
        apiResult = await rechargeKitPayout(req.body.providerKey, bankParams);
      } else if (req.body.providerKey === 'AERON_PAY') {
        apiResult = await aeronPayPayout(req.body.providerKey, bankParams);
      } else {
        apiResult = await unPayPayout(req.body.providerKey, bankParams);
      }

      if (!apiResult || typeof apiResult !== 'object' || !apiResult.txn_status) {
        apiResult = {
          txn_status: 'FAILED',
          utr: '',
          acknowledged: '',
          message: 'Invalid or missing API response',
          full_response: {}
        };
      }

      const statusMap = {
        INITIATE:0,
        SUCCESS: 2,
        PENDING: 1,
        FAILED: 3
      };
      const txnStatus = statusMap[apiResult.txn_status] ?? 0;

      // Deduct balance only if not failed
      if (txnStatus !== 2) {
        user.topup -= amount;
        await user.save({ transaction: t3 });
      }

      await transactionRecord.update({
        status: txnStatus,
        utrNo: apiResult.utr,
        gst: apiResult.full_response?.gst || 0,
        tds: apiResult.full_response?.tds || 0,
        apiresponseDetails: apiResult.full_response
      }, { transaction: t3 });

      return apiResult;
    });

    res.status(200).json({
      status: 200,
      message: 'Payout processed',
      data: result
    });

  } catch (err) {
    next(err);
  }
};

const getAllTransactionByUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = 10;
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const offset = (page - 1) * limit;

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: { user_id: userId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['updatedAt'] },
    });

    res.status(200).json({
      status: 200,
      message: 'Transactions fetched successfully',
      data: transactions,
      meta: {
        total: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};
const getAllTransactionsForAdmin = async (req, res, next) => {
  try {
    const limit = 10;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    const {
      user_id,
      status,
      mode,
      startDate,
      endDate
    } = req.query;

    // Build dynamic filters
    const whereClause = {};

    if (user_id) {
      whereClause.user_id = user_id;
    }

    if (status) {
      whereClause.status = status; // 0, 1, 2
    }

    if (mode) {
      whereClause.mode = mode; // 'IMPS', 'NEFT'
    }

    if (startDate || endDate) {
      whereClause.transactionDate = {
        ...(startDate && { [Op.gte]: new Date(startDate) }),
        ...(endDate && { [Op.lte]: new Date(endDate) })
      };
    }

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['id', 'companyName', 'mobileNumber', 'email']
      }],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['updatedAt'] },
    });

    res.status(200).json({
      status: 200,
      message: 'Admin transactions fetched successfully',
      data: transactions,
      meta: {
        total: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    next(err);
  }
}
const createPublicPayoutByUser = async (req, res, next) => {
  try {
    const {
      access_token,
      beneAccNum,
      beneIfscCode,
      beneName,
      txnPaymode,
      txnAmount,
      orderid
    } = req.body;

    if (!access_token) throw createError(401, 'Access token is required');

    const user = await User.findOne({ where: { access_token: access_token } });
    if (!user || !user.status) throw createError(403, 'Unauthorized user');

    const amount = parseFloat(txnAmount);
    const txnId = orderid || generateApiTxnId();
    let bankParams = {};
    const providerKey = user.default_provider || 'AERON_PAY';

    // 1️⃣ Lock user and validate balance
    const lockedUser = await sequelize.transaction(async t1 => {
      const u = await User.findByPk(user.id, {
        transaction: t1,
        lock: t1.LOCK.UPDATE,
      });
      if (!u) throw createError(404, 'User not found');
      if (u.topup < amount || u.topup === 0) {
        throw createError(400, 'Insufficient balance');
      }
      return u;
    });
    const mobileNumber=user.mobileNumber;
  

    // 2️⃣ Prepare bankParams + Log transaction
    const transactionRecord = await sequelize.transaction(async t2 => {
      if (providerKey === 'RECHARGEKIT_PAY') {
        bankParams = {
          mode: txnPaymode,
          name: beneName,
          account_no: beneAccNum,
          bank_name: 'BANK',
          ifsc: beneIfscCode,
          mobile_no: mobileNumber || '',
          beneficiary_name: beneName,
          amount,
          transfer_type: '5',
          partner_request_id: txnId
        };
      } else if (providerKey === 'AERON_PAY') {
        bankParams = {
          accountNumber: beneAccNum,
          amount,
          apitxnid: txnId,
          transferMode: txnPaymode,
          remarks: 'imps',
          beneAccount: beneAccNum,
          ifsc: beneIfscCode,
          beneName,
          email: user.email || '',
          mobile: mobileNumber || '',
          address: user.address || 'N/A'
        };
      } else {
        bankParams = {
          mode: txnPaymode,
          name: beneName,
          account: beneAccNum,
          bank: 'BANK',
          ifsc: beneIfscCode,
          mobile_no: mobileNumber || '',
          amount,
          apitxnid: txnId
        };
      }

      return await Transaction.create({
        user_id: user.id,
        transactionDate: new Date(),
        transactionId: txnId,
        gatwayId: txnId,
        orderId: txnId,
        mode: txnPaymode,
        bankDetails: bankParams,
        amount,
        status: 0,
        apiName: providerKey,
      }, { transaction: t2 });
    });

    // 3️⃣ Call provider and update transaction
    const result = await sequelize.transaction(async t3 => {
      let apiResult;
      if (providerKey === 'RECHARGEKIT_PAY') {
        apiResult = await rechargeKitPayout(providerKey, bankParams);
      } else if (providerKey === 'AERON_PAY') {
        apiResult = await aeronPayPayout(providerKey, bankParams);
      } else {
        apiResult = await unPayPayout(providerKey, bankParams);
      }

      if (!apiResult || typeof apiResult !== 'object' || !apiResult.txn_status) {
        apiResult = {
          txn_status: 'FAILED',
          utr: '',
          acknowledged: '',
          message: 'Invalid or missing API response',
          full_response: {}
        };
      }

     const statusMap = {
  INITIATE: 0,
  SUCCESS: 2,
  PENDING: 1,
  FAILED: 3
};
if (!statusMap[apiResult.txn_status]) {
  console.warn('Unknown txn_status:', apiResult.txn_status);
}

      const txnStatus = statusMap[apiResult.txn_status] ?? 3;

      if (txnStatus !== 3) {
        lockedUser.topup -= amount;
        await lockedUser.save({ transaction: t3 });
      }

      await transactionRecord.update({
        status: txnStatus,
        utrNo: apiResult.utr,
        gst: apiResult.full_response?.gst || 0,
        tds: apiResult.full_response?.tds || 0,
        apiresponseDetails: apiResult.full_response
      }, { transaction: t3 });

      return apiResult;
    });

    // 4️⃣ Build response
    const response = {
      result: result.txn_status === 'SUCCESS' ? 1 : (result.txn_status === 'Pending' ? 2 : 0),
      message:
        result.txn_status === 'SUCCESS'
          ? 'Bank Transfer has Successful'
          : result.txn_status === 'Pending'
            ? 'Bank Transfer Transaction has Pending'
            : 'Bank Transfer has failed',
      data: [
        {
          order_id: txnId,
          tnx_id: result.full_response?.tnx_id || txnId,
          beneName: beneName,
          beneIfscCode: beneIfscCode,
          beneAccNum: beneAccNum,
          status: result.txn_status,
          utr: result.utr || '',
          txnAmount: txnAmount,
          txnPaymode: txnPaymode,
          charge: result.full_response?.charge || "5",
          tds: result.full_response?.tds || 0,
          gst: result.full_response?.gst || 0,
          txn_date: result.full_response?.txn_date || new Date().toISOString().slice(0, 19).replace('T', ' ')
        }
      ]
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPayoutByUser,
  getAllTransactionByUser,
  getAllTransactionsForAdmin,
  createPublicPayoutByUser
}