// utils/logHelper.js

const Log = require('../model/userLogSchema');

const createLog = async ({
  action,
  performedBy = {},
  payload = {},
  status = 'success',
  error = null,
  meta = {}
}) => {
  try {
    const log = new Log({
      action,
      performedBy,
      payload,
      status,
      error,
      meta
    });
    await log.save();
    return log;
  } catch (err) {
    console.error('❌ Failed to save log:', err);
  }
};

module.exports = createLog;
