const mongoose = require('mongoose');
const { getIsReplicaSet } = require('../config/db');

/**
 * Executes a callback within a MongoDB session/transaction if replica set is available,
 * or gracefully runs callback directly with atomic document-level operations.
 *
 * @param {Function} callback - async (session) => { ... }
 * @returns {Promise<any>}
 */
const withTransaction = async (callback) => {
  const isReplica = getIsReplicaSet();

  if (!isReplica) {
    // Standalone MongoDB does not support multi-document transactions.
    // Rely on conditional atomic queries (e.g., findOneAndUpdate with preconditions)
    return await callback(null);
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

module.exports = {
  withTransaction
};
