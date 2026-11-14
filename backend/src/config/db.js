
const mongoose = require('mongoose');

let isReplicaSet = false;

const connectDB = async (uri) => {
  const mongoURI = uri || process.env.MONGODB_URI;

  // Never silently fall back to local MongoDB in production
  if (!mongoURI) {
    throw new Error('MONGODB_URI is missing from environment variables');
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      maxPoolSize: 10,
    });

    console.log(
      `[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`
    );

    // Detect replica set support
    try {
      const status = await conn.connection.db.admin().command({
        replSetGetStatus: 1,
      });

      isReplicaSet = !!status.ok;
    } catch {
      isReplicaSet = false;
    }

    console.log(`[MongoDB] Replica Set active: ${isReplicaSet}`);

    return conn;
  } catch (err) {
    isReplicaSet = false;
    console.error('[MongoDB] Connection failed:', err.message);
    throw err;
  }
};

const getIsReplicaSet = () => isReplicaSet;

module.exports = {
  connectDB,
  getIsReplicaSet,
};
