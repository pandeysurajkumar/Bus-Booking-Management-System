const { generateTransactionId } = require('../utils/pnrGenerator');
const { PAYMENT_STATUS, PAYMENT_METHODS } = require('../config/constants');

/**
 * Realistic Simulated Payment Service.
 * Designed with a clean interface so Razorpay / Stripe can be plugged in seamlessly.
 */
class PaymentService {
  /**
   * Process simulated payment transaction
   * @param {Object} paymentData
   * @param {number} paymentData.amount
   * @param {string} paymentData.paymentMethod
   * @param {boolean} [paymentData.simulatedSuccess=true]
   * @param {Object} [paymentData.methodDetails]
   * @returns {Promise<Object>}
   */
  async processPayment({
    amount,
    paymentMethod = PAYMENT_METHODS.UPI,
    simulatedSuccess = true,
    methodDetails = {}
  }) {
    const transactionId = generateTransactionId('PAY');

    if (!simulatedSuccess) {
      return {
        status: PAYMENT_STATUS.FAILED,
        transactionId,
        amount,
        paymentMethod,
        paidAt: null,
        gatewayResponse: {
          code: 'PAYMENT_DECLINED',
          message: 'Simulated payment was declined by issuing bank/PSP',
          gateway: 'AlgionsMockPayEngine'
        }
      };
    }

    // Success response with mock metadata based on payment method
    let responseMetadata = {};
    if (paymentMethod === PAYMENT_METHODS.UPI) {
      responseMetadata = {
        upiId: methodDetails.upiId || 'customer@okaxis',
        bankRrn: `RRN${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        authCode: 'UPI_SUCCESS_200'
      };
    } else if (paymentMethod === PAYMENT_METHODS.CARD) {
      responseMetadata = {
        cardLast4: methodDetails.cardLast4 || '4242',
        cardNetwork: methodDetails.cardNetwork || 'Visa',
        authCode: 'AUTH_APPROVED_200'
      };
    } else if (paymentMethod === PAYMENT_METHODS.NET_BANKING) {
      responseMetadata = {
        bankName: methodDetails.bankName || 'State Bank of India',
        referenceNumber: `NETB_${Math.floor(10000000 + Math.random() * 90000000)}`
      };
    } else if (paymentMethod === PAYMENT_METHODS.WALLET) {
      responseMetadata = {
        walletProvider: methodDetails.walletProvider || 'Paytm Wallet',
        walletTxnRef: `WAL_${Math.floor(10000000 + Math.random() * 90000000)}`
      };
    }

    return {
      status: PAYMENT_STATUS.SUCCESS,
      transactionId,
      amount,
      paymentMethod,
      paidAt: new Date(),
      methodDetails: responseMetadata,
      gatewayResponse: {
        code: 'SUCCESS',
        message: 'Simulated transaction completed successfully',
        gateway: 'AlgionsMockPayEngine',
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Process simulated refund
   * @param {Object} refundData
   * @param {number} refundData.refundAmount
   * @param {string} refundData.originalTransactionId
   */
  async processRefund({ refundAmount, originalTransactionId }) {
    const refundTransactionId = generateTransactionId('REF');
    return {
      status: 'completed',
      refundTransactionId,
      originalTransactionId,
      refundAmount,
      processedAt: new Date(),
      gatewayResponse: {
        code: 'REFUND_PROCESSED',
        message: 'Simulated instant refund credit to original payment source'
      }
    };
  }
}

module.exports = new PaymentService();
