const crypto = require('crypto');

/**
 * Generates an uppercase 10-character PNR (e.g., 'ALG7K9D2M1')
 * @returns {string}
 */
const generatePNR = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed confusing 0/O, 1/I
  let randomPart = '';
  const bytes = crypto.randomBytes(7);
  for (let i = 0; i < 7; i++) {
    randomPart += chars[bytes[i] % chars.length];
  }
  return `ALG${randomPart}`;
};

/**
 * Generates a unique simulated transaction ID (e.g., 'TXN_20261114_A8F19C')
 * @returns {string}
 */
const generateTransactionId = (prefix = 'TXN') => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}_${dateStr}_${randomHex}`;
};

module.exports = {
  generatePNR,
  generateTransactionId
};
