const axios = require('axios');

/**
 * AeronPay payout handler
 * @param {string} providerKey - Should be 'AERON_PAY'
 * @param {object} params - Parameters from controller
 */
async function aeronPayPayout(providerKey, params) {
  if (providerKey !== 'AERON_PAY') {
    throw new Error(`Invalid providerKey for AeronPay: ${providerKey}`);
  }

  const payload = {
    bankProfileId: '1',
    bankid: '110',
    accountNumber: params.accountNumber, // e.g., sender's account
    amount: params.amount.toString(),
    client_referenceId: params.apitxnid,
    transferMode: params.transferMode || 'imps',
    remarks: params.remarks || 'imps',
    latitude: '20.1236', // could be dynamic later
    longitude: '78.1228',
    beneDetails: {
      bankAccount: params.beneAccount,
      ifsc: params.ifsc,
      name: params.beneName,
      email: params.email,
      phone: params.mobile,
      address1: params.address
    }
  };

    try {
        const response = await axios.post(
            'https://api.aeronpay.in/api/serviceapi-prod/api/payout/imps',
            payload,
            {
                headers: {
                    accept: 'application/json',
                    'content-Type': 'application/json',
                    'client-id': process.env.AERON_CLIENT_ID,       // 🔒 Store securely
                    'client-secret': process.env.AERON_CLIENT_SECRET
                }
            }
        );

    const data = response.data;

    return {
      subCode: data.status === 'SUCCESS' ? '200' : '202',
      txn_status: data.status || 'PENDING',
      api_txn_id: data.txnId || '',
      utr: data.utr || '',
      acknowledged: data.txnId || '',
      message: data.message || '',
      full_response: data
    };
  } catch (err) {
    console.error('AeronPay API Error:', err?.response?.data || err.message);

    return {
      subCode: '500',
      txn_status: 'FAILED',
      api_txn_id: '',
      utr: '',
      acknowledged: '',
      message: err?.response?.data?.message || 'API Request Failed',
      full_response: err?.response?.data || {}
    };
  }
}

module.exports = aeronPayPayout;
