const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');


const proxyAgent = new HttpsProxyAgent({
  host: '45.93.214.197',
  port: 8000,
  auth: 'Tr94B0:Uy7XGq',
  protocol: 'http:' // or 'https:' depending on your proxy
});


async function rechargeKitPayout(providerKey, params) {
  if (providerKey !== 'RECHARGEKIT_PAY') {
    throw new Error(`No RechargeKit config for ${providerKey}`);
  }
  console.log("process.env.RKIT_API_TOKEN",process.env.RKIT_API_BASE_URL)

  const body = {
    mobile_no: "9668305427" || params.mobile,
    account_no: "109566016481",
    ifsc: "DNSB0000021",
    bank_name: "DBS",
    beneficiary_name: "Wasim Reja",
    amount: "1",
    transfer_type: params.transfer_type || '5', // 5 = IMPS, 6 = NEFT
    partner_request_id: "1451"
  };

  const resp = await axios.post(
    `${process.env.RKIT_API_BASE_URL}/rkitpayout/payoutTransfer`,
    body,
    {
      headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW1iZXJJZCI6MTMzLCJpYXQiOjE3Mzc2NTg1NTd9.TMIwDn03lAvag8rs7FScF0JYMj-2TH0qN1N814wfKC4`,
        'Content-Type': 'application/json'
      },
    //  httpsAgent: proxyAgent
}
  );

  const data = resp.data;

  return {
    subCode: data.status === 1 ? '200' : '202',
    txn_status: data.status === 1 ? 'SUCCESS' : 'PENDING',
    api_txn_id: data.orderid || '',
    utr: data.optransid || '',
    acknowledged: data.optransid || '',
    message: data.msg || '',
    full_response: data
  };
}

module.exports = { rechargeKitPayout };
