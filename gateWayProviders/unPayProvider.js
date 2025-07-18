
const fetch = require('node-fetch');
const crypto = require('crypto');


function aesEncrypt(jsonPayload, aesKeyHex) {
  const aesKey = Buffer.from(aesKeyHex, 'hex');
  const iv = aesKey.slice(0, 16);
  const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
  const encrypted = Buffer.concat([
    cipher.update(jsonPayload, 'utf8'),
    cipher.final()
  ]);
  return encrypted.toString('hex');
}

async function sendPayoutRequest(encryptedHex) {
  const resp = await fetch(process.env.UNPAY_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'api-key': process.env.UNPAY_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ body: encryptedHex })
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${text}`);
  }
  return resp.json();
}


async function unPayPayout(providerKey, params) {
  if (providerKey !== 'UNPAY_MAGIKPAY') {
    throw new Error(`No provider configured for ${providerKey}`);
  }

  const json = JSON.stringify({
    partner_id: '2033',
    latitude: '22.5754',
    longitude: '88.4798',
    webhook: process.env.UNPAY_WEBHOOK,
    ...params
  });
  const encryptedHex = aesEncrypt(json, process.env.UNPAY_AES_KEY);
  const resp = await sendPayoutRequest(encryptedHex);

  const { statuscode, txnid, refno, message } = resp || {};
  return {
    subCode: statuscode === 'TXN' ? '200' : statuscode === 'ERR' ? '400' : '200',
    txn_status: statuscode === 'TXN' ? 'SUCCESS'
               : statuscode === 'ERR' ? 'FAILED'
               : 'PENDING',
    api_txn_id: txnid || '',
    utr: refno || '',
    acknowledged: refno || '',
    message: message || '',
    full_response: resp
  };
}

module.exports = { unPayPayout };
