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

    const body = {
        mobile_no: params.mobile_no,
        account_no: params.account_no,
        ifsc: params.ifsc,
        bank_name: params.bank_name,
        beneficiary_name: params.beneficiary_name,
        amount: params.amount.toString(),
        transfer_type: params.transfer_type || '5', // 5 = IMPS, 6 = NEFT
        partner_request_id: params.partner_request_id
    };
    const resp = await axios.post(
        `${process.env.RKIT_API_BASE_URL}/rkitpayout/payoutTransfer`,
        body,
        {
            headers: {
                Authorization: `Bearer ${process.env.RKIT_API_TOKEN}`,
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
